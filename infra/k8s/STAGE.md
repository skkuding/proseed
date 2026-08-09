# Stage 환경 배포

환경은 Git revision, Kustomize overlay, 이미지 태그, namespace, DB, Secret,
S3 버킷을 각각 분리합니다.

| 환경  | Git revision | Kustomize             | 이미지 태그 | namespace                     |
| ----- | ------------ | --------------------- | ----------- | ----------------------------- |
| stage | `main`       | `overlays/staging`    | `:stage`    | `proseed-stage`               |
| prod  | `release`    | `overlays/production` | `:prod`     | `proseed`, `proseed-postgres` |

기능 브랜치를 `main`에 머지하면 stage에 자동 반영하고, stage 검증 후
`main`을 `release`에 머지해 prod로 승격합니다. 데이터와 Secret은 환경 간에
승격하거나 복제하지 않습니다.

## GitOps 소유권

실제 ArgoCD application의 SSOT는 이 저장소가 아니라
`skkuding/lab/k8s/argocd/applications/proseed`입니다.
따라서 stage/prod Application 변경은 반드시 lab 저장소에 반영해야 하며,
이 저장소에는 중복 Application 템플릿을 두지 않습니다.

prod application 3개는 lab 저장소에서 `targetRevision: release`를 사용하고,
web/api Image Updater는 각각 `:prod`만 digest 전략으로 추적해야 합니다. stage
application은 `targetRevision: main`과 `:stage`를 사용합니다.

## 최초 전환 순서

> 현재 prod Image Updater가 모든 태그 중 newest build를 선택하는 동안에는
> `main`에서 `:stage` 이미지를 먼저 발행하면 안 됩니다. prod가 stage 빌드를
> 선택할 수 있습니다.
>
> 또한 `release`가 현재 운영 `main`보다 뒤처진 상태에서 prod application의
> `targetRevision`을 `release`로 먼저 바꾸면 운영 코드가 과거 버전으로
> 롤백됩니다. 아래 순서를 바꾸지 않습니다.

1. 현재 `main`에서 `release` 브랜치를 만들고 PR merge만 허용하도록 보호합니다.
2. 기존 `release`가 있다면 `main -> release` PR로 현재 운영 `main`과 먼저
   동기화하고, 두 브랜치의 SHA가 같은지 확인합니다. 이때 prod는 아직 `main`을
   추적하므로 운영 리소스는 변경되지 않습니다.
3. `skkuding/lab`에서 prod application 3개를 `release`로 전환하고 web/api가
   `:prod`만 추적하도록 변경한 뒤, prod가 계속 Healthy인지 확인합니다.
4. 이 staging 변경을 `main`에 머지해 `:stage` 이미지를 발행합니다.
5. stage application 3개를 lab 저장소에 등록합니다.
6. stage 검증이 끝난 커밋만 `main -> release` PR로 승격합니다. release push
   workflow가 `:prod` 이미지를 자동 발행하므로 로컬 수동 태깅은 필요하지 않습니다.

## 최초 1회 준비

### 1. AWS 리소스

계획에서 stage Route53, S3, IAM 외의 예상하지 않은 변경이 없는지 확인한 뒤
적용합니다.

```bash
AWS_PROFILE=proseed terraform -chdir=infra/aws plan
AWS_PROFILE=proseed terraform -chdir=infra/aws apply
```

### 2. OAuth 앱

장기 운영에서는 stage 전용 OAuth 앱을 권장합니다. 초기 내부 검증에서는 기존
prod OAuth 앱을 재사용할 수 있지만, 기존 prod callback을 덮어쓰지 말고 아래
stage callback을 추가해야 합니다. OAuth Client를 재사용하더라도
`BETTER_AUTH_SECRET`과 Kubernetes SealedSecret은 stage 전용으로 분리합니다.

- `https://stage.proseednow.com/api/auth/callback/google`
- `https://stage.proseednow.com/api/auth/callback/kakao`
- `https://stage.proseednow.com/api/auth/callback/naver`

### 3. Stage API Secret

stage 전용 AWS 값과 선택한 OAuth Client 값을 대상 클러스터 키로 봉인합니다.
`KUBECONFIG`와 context를 반드시 명시합니다.

```bash
export AWS_ACCESS_KEY_ID="$(AWS_PROFILE=proseed terraform -chdir=infra/aws output -raw proseed_stage_access_key_id)"
export AWS_SECRET_ACCESS_KEY="$(AWS_PROFILE=proseed terraform -chdir=infra/aws output -raw proseed_stage_secret_access_key)"
export BETTER_AUTH_SECRET='<stage-secret>'
export GOOGLE_CLIENT_ID='<stage-google-client-id>'
export GOOGLE_CLIENT_SECRET='<stage-google-client-secret>'
export KAKAO_CLIENT_ID='<stage-kakao-client-id>'
export KAKAO_CLIENT_SECRET='<stage-kakao-client-secret>'
export NAVER_CLIENT_ID='<stage-naver-client-id>'
export NAVER_CLIENT_SECRET='<stage-naver-client-secret>'

kubectl --context lab -n proseed-stage create secret generic proseed-aws-credentials \
  --from-literal=aws_access_key_id="${AWS_ACCESS_KEY_ID}" \
  --from-literal=aws_secret_access_key="${AWS_SECRET_ACCESS_KEY}" \
  --dry-run=client -o yaml | \
kubeseal --context lab --controller-name sealed-secrets-controller \
  --controller-namespace kube-system --format yaml \
  > infra/k8s/api/overlays/staging/aws-credentials.yaml

kubectl --context lab -n proseed-stage create secret generic oauth-credentials \
  --from-literal=BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET}" \
  --from-literal=GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}" \
  --from-literal=GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}" \
  --from-literal=KAKAO_CLIENT_ID="${KAKAO_CLIENT_ID}" \
  --from-literal=KAKAO_CLIENT_SECRET="${KAKAO_CLIENT_SECRET}" \
  --from-literal=NAVER_CLIENT_ID="${NAVER_CLIENT_ID}" \
  --from-literal=NAVER_CLIENT_SECRET="${NAVER_CLIENT_SECRET}" \
  --dry-run=client -o yaml | \
kubeseal --context lab --controller-name sealed-secrets-controller \
  --controller-namespace kube-system --format yaml \
  > infra/k8s/api/overlays/staging/oauth-credentials.yaml
```

생성된 `oauth-credentials.yaml`과 `aws-credentials.yaml`은
`infra/k8s/api/overlays/staging/kustomization.yaml`의 `resources`에 모두
포함해야 합니다. 둘 중 하나라도 없으면 stage API application을 등록하지 않습니다.

## 검증

```bash
kubectl kustomize infra/k8s/web
kubectl kustomize infra/k8s/api
kubectl kustomize infra/k8s/postgres
kubectl kustomize infra/k8s/web/overlays/staging
kubectl kustomize infra/k8s/api/overlays/staging
kubectl kustomize infra/k8s/postgres/overlays/staging

kubectl --context lab -n argocd get application \
  proseed-postgres-stage proseed-web-stage proseed-api-stage
kubectl --context lab -n proseed-stage get pod,pvc,ingress,certificate,sealedsecret
kubectl --context lab describe node | sed -n '/Allocated resources:/,/Events:/p'
curl -I https://stage.proseednow.com
```

검증 기준:

- stage의 모든 namespaced resource가 `proseed-stage`에만 존재
- stage DB/PVC가 prod와 별도이고 초기화 후 migration Job만 실행
- web/api 이미지가 `:stage`, prod 이미지가 `:prod`
- stage에 prod backup CronJob이 없음
- 응답에 `X-Robots-Tag: noindex, nofollow, noarchive` 포함
- ArgoCD stage application 3개가 `Synced` 및 `Healthy`
