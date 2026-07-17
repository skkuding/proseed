# PostgreSQL 백업 및 복구

온프레미스 PostgreSQL은 단일 Pod와 `local-path` PVC 하나를 사용합니다. PVC
장애가 전체 데이터 유실로 이어지지 않도록 매일 논리 백업을 S3로 전송합니다.

## 백업 구성

- 실행 시각: 매일 04:00 KST (`spec.timeZone: Asia/Seoul`)
- 데이터베이스: `postgres-svc.proseed-postgres.svc.cluster.local:5432/skkuding`
- 저장 위치: `s3://proseed-db-backups/postgres/`
- 파일 형식: gzip으로 압축한 plain SQL
- 보존 기간: S3 Lifecycle로 7일
- 백업 IAM: 해당 버킷의 `postgres/` prefix에 대한 `s3:PutObject`만 허용

CronJob은 다음 파이프라인을 실행합니다.

```sh
pg_dump ... | gzip | aws s3 cp - s3://proseed-db-backups/postgres/<timestamp>.sql.gz
```

`set -o pipefail`을 사용하므로 `pg_dump`, `gzip`, S3 업로드 중 하나라도 실패하면
Job이 실패하며 오류가 컨테이너 로그에 남습니다.

## 1. AWS 리소스 적용

`infra/aws/database-backup.tf`에 다음 리소스가 정의되어 있습니다.

- `proseed-db-backups` S3 버킷
- Public Access Block 전체 차단
- SSE-S3 AES256 암호화
- 생성 후 7일 만료 Lifecycle
- 실패한 multipart upload는 1일 후 정리
- 업로드 전용 IAM User와 Access Key

적용 전에 확인합니다.

```sh
terraform -chdir=infra/aws init
terraform -chdir=infra/aws fmt -check
terraform -chdir=infra/aws validate
terraform -chdir=infra/aws plan
```

검토한 plan만 적용합니다.

```sh
terraform -chdir=infra/aws apply
```

Access Key secret은 Terraform state에 저장되므로 state 접근 권한을 제한해야
합니다.

## 2. S3 SealedSecret 생성

AWS 키를 평문 YAML이나 env 파일로 저장하면 안 됩니다. Terraform 적용 후 민감한
output을 화면에 출력하지 않고 shell 변수로 가져옵니다.

```sh
AWS_ACCESS_KEY_ID="$(terraform -chdir=infra/aws output -raw postgres_backup_access_key_id)"
AWS_SECRET_ACCESS_KEY="$(terraform -chdir=infra/aws output -raw postgres_backup_secret_access_key)"
```

평문 Secret 파일을 만들지 않고 `kubectl` 출력을 바로 `kubeseal`에 전달합니다.

```sh
printf 'AWS_ACCESS_KEY_ID=%s\nAWS_SECRET_ACCESS_KEY=%s\n' \
  "$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY" \
| kubectl create secret generic backup-s3-credentials \
  --namespace proseed-postgres \
  --from-env-file=/dev/stdin \
  --dry-run=client \
  -o yaml \
| kubeseal \
  --context lab \
  --controller-name sealed-secrets-controller \
  --controller-namespace kube-system \
  --format yaml \
> infra/k8s/postgres/backup/s3-credentials.yaml

unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
```

현재 `lab` 컨트롤러가 암호문을 복호화할 수 있는지 검증합니다.

```sh
kubeseal \
  --context lab \
  --controller-name sealed-secrets-controller \
  --controller-namespace kube-system \
  --validate \
  < infra/k8s/postgres/backup/s3-credentials.yaml
```

생성된 파일에 `encryptedData`만 있고 실제 AWS 키가 없는지 확인합니다. 이후
`kustomization.yaml`에 SealedSecret과 CronJob을 함께 추가합니다.

```yaml
resources:
  - db-credentials.yaml
  - backup/s3-credentials.yaml
  - backup/cronjob.yaml
  - deployment.yaml
  - namespace.yaml
  - service.yaml
  - pvc.yaml
```

SealedSecret과 CronJob은 반드시 같은 커밋에서 등록합니다.

## 3. 렌더링 및 배포

```sh
kubectl kustomize infra/k8s/postgres
```

PostgreSQL 리소스는 ArgoCD가 관리하므로 GitOps 절차로 배포합니다. 배포 후
SealedSecret이 실제 Secret을 생성했는지 확인합니다.

```sh
kubectl --context lab get sealedsecret,secret \
  --namespace proseed-postgres \
  backup-s3-credentials
```

## 4. 백업 수동 실행

04:00 KST까지 기다리지 않고 CronJob에서 일회성 Job을 생성합니다.

```sh
JOB_NAME="postgres-backup-manual-$(date +%Y%m%d%H%M%S)"

kubectl --context lab create job \
  --from=cronjob/postgres-backup \
  "$JOB_NAME" \
  --namespace proseed-postgres

kubectl --context lab logs \
  --follow \
  "job/$JOB_NAME" \
  --namespace proseed-postgres
```

Job이 `Complete`인지 확인합니다.

```sh
kubectl --context lab get job "$JOB_NAME" --namespace proseed-postgres
```

실패한 경우 Job과 Pod 이벤트 및 로그를 확인합니다.

```sh
kubectl --context lab describe job "$JOB_NAME" --namespace proseed-postgres
kubectl --context lab logs "job/$JOB_NAME" --namespace proseed-postgres
```

## 5. S3 객체와 Lifecycle 검증

검증에는 `ListBucket`, `GetObject` 권한이 있는 운영자용 AWS 계정을 사용합니다.
백업 CronJob의 IAM에는 해당 권한을 추가하지 않습니다.

```sh
aws s3 ls s3://proseed-db-backups/postgres/

aws s3api head-object \
  --bucket proseed-db-backups \
  --key postgres/<backup-object>.sql.gz
```

다음을 확인합니다.

- 객체 크기(`ContentLength`)가 0보다 큼
- `ServerSideEncryption`이 `AES256`

Lifecycle 설정을 확인합니다.

```sh
aws s3api get-bucket-lifecycle-configuration \
  --bucket proseed-db-backups
```

만료 설정이 7일이어야 합니다. Lifecycle 삭제는 비동기이므로 객체가 만료된 직후가
아니라 이후에 삭제될 수 있습니다.

## 6. 복구 리허설

복구에는 `s3:GetObject` 권한이 있는 운영자용 AWS 계정을 사용합니다. 운영 DB에
바로 복구하지 않고 빈 리허설 DB에서 먼저 검증합니다.

```sh
BACKUP_URI='s3://proseed-db-backups/postgres/<backup-object>.sql.gz'
```

리허설 DB를 생성합니다.

```sh
kubectl --context lab exec \
  --namespace proseed-postgres \
  deployment/postgres \
  -- sh -c 'createdb --username="$POSTGRES_USER" skkuding_restore_rehearsal'
```

S3 객체를 받아 `psql`로 바로 복구합니다. `pipefail`과 `ON_ERROR_STOP`으로
다운로드·압축 해제·SQL 오류를 모두 감지합니다.

```sh
set -o pipefail

aws s3 cp "$BACKUP_URI" - \
| gunzip -c \
| kubectl --context lab exec \
  --stdin \
  --namespace proseed-postgres \
  deployment/postgres \
  -- sh -c 'psql \
    --set=ON_ERROR_STOP=on \
    --username="$POSTGRES_USER" \
    --dbname=skkuding_restore_rehearsal'
```

스키마와 핵심 데이터 row 수를 확인합니다.

```sh
kubectl --context lab exec \
  --namespace proseed-postgres \
  deployment/postgres \
  -- sh -c 'psql \
    --username="$POSTGRES_USER" \
    --dbname=skkuding_restore_rehearsal \
    --command="\\dt"'
```

최소한 `user`, `project` 테이블의 row 수를 확인합니다. 원본 DB와 직접 비교하려면
백업 이후 쓰기가 없거나 애플리케이션 쓰기를 중단한 상태여야 합니다.

```sh
for database_name in skkuding skkuding_restore_rehearsal; do
  kubectl --context lab exec \
    --namespace proseed-postgres \
    deployment/postgres \
    -- sh -c "psql \
      --username=\"\$POSTGRES_USER\" \
      --dbname=${database_name} \
      --tuples-only \
      --command='SELECT COUNT(*) AS user_count FROM \"user\"; SELECT COUNT(*) AS project_count FROM project;'"
done
```

백업 이후 쓰기가 없었다면 두 DB의 각 row 수가 일치해야 합니다. 쓰기가 계속된
환경에서는 현재 운영 DB가 아니라 백업 시점에 기록한 row 수와 비교합니다.

결과를 기록한 후 리허설 DB를 삭제합니다.

```sh
kubectl --context lab exec \
  --namespace proseed-postgres \
  deployment/postgres \
  -- sh -c 'dropdb --username="$POSTGRES_USER" skkuding_restore_rehearsal'
```

리허설 기록 형식:

```text
실행 일시(KST):
백업 객체:
복구 DB: skkuding_restore_rehearsal
확인한 테이블과 row 수:
결과: SUCCESS / FAILURE
작업자:
비고:
```

## 7. 운영 복구 절차

운영 복구는 장애 대응 담당자와 작업 시간을 합의한 뒤 수행합니다. 복구용 AWS
계정에는 `s3:ListBucket`, `s3:GetObject` 권한이 필요합니다.

### 7.1 애플리케이션 쓰기 중단

- API 트래픽과 배치 작업을 중단합니다.
- ArgoCD self-heal로 API가 다시 기동되지 않도록 배포 상태를 함께 조정합니다.
- API의 Prisma migration Job을 복구보다 먼저 실행하지 않습니다.
- 기존 PVC를 읽을 수 있다면 현재 DB를 추가 백업합니다.

### 7.2 복구할 백업 선택

최근 백업 목록을 확인하고 객체 크기가 0보다 큰 백업을 선택합니다.

```sh
aws s3api list-objects-v2 \
  --bucket proseed-db-backups \
  --prefix postgres/ \
  --query 'reverse(sort_by(Contents, &LastModified))[:10].[LastModified,Size,Key]' \
  --output table

BACKUP_KEY='postgres/<backup-object>.sql.gz'
BACKUP_URI="s3://proseed-db-backups/${BACKUP_KEY}"
```

객체 메타데이터와 gzip 무결성을 확인합니다.

```sh
aws s3api head-object \
  --bucket proseed-db-backups \
  --key "$BACKUP_KEY"

set -o pipefail
aws s3 cp "$BACKUP_URI" - | gzip -t
```

### 7.3 빈 PostgreSQL 준비

새 PVC와 PostgreSQL Pod가 `Ready`인지 확인합니다.

```sh
kubectl --context lab get pod,pvc \
  --namespace proseed-postgres
```

복구 대상 `skkuding` DB에 사용자 테이블이 없는지 확인합니다.

```sh
kubectl --context lab exec \
  --namespace proseed-postgres \
  deployment/postgres \
  -- sh -c 'psql \
    --username="$POSTGRES_USER" \
    --dbname=skkuding \
    --tuples-only \
    --command="SELECT COUNT(*) FROM pg_tables WHERE schemaname = current_schema();"'
```

결과가 `0`이 아니면 복구를 중단합니다. plain SQL dump를 데이터가 있는 DB 위에
덮어쓰면 안 됩니다.

### 7.4 S3에서 운영 DB로 복구

```sh
set -o pipefail

aws s3 cp "$BACKUP_URI" - \
| gunzip -c \
| kubectl --context lab exec \
  --stdin \
  --namespace proseed-postgres \
  deployment/postgres \
  -- sh -c 'psql \
    --set=ON_ERROR_STOP=on \
    --username="$POSTGRES_USER" \
    --dbname=skkuding'
```

명령이 0으로 종료돼야 합니다. S3 다운로드, gzip 또는 SQL 중 하나라도 실패하면
`pipefail`과 `ON_ERROR_STOP`에 의해 전체 명령이 실패합니다.

### 7.5 복구 검증

스키마, 핵심 테이블 row 수와 Prisma migration 이력을 확인합니다.

```sh
kubectl --context lab exec \
  --namespace proseed-postgres \
  deployment/postgres \
  -- sh -c 'psql \
    --set=ON_ERROR_STOP=on \
    --username="$POSTGRES_USER" \
    --dbname=skkuding \
    --command="\\dt" \
    --command="SELECT COUNT(*) AS user_count FROM \"user\";" \
    --command="SELECT COUNT(*) AS project_count FROM project;" \
    --command="SELECT COUNT(*) AS migration_count FROM _prisma_migrations;"'
```

필요하면 복구된 DB에 현재 애플리케이션 버전의 미적용 migration만 실행합니다.
복구 직후 통계 정보를 갱신합니다.

```sh
kubectl --context lab exec \
  --namespace proseed-postgres \
  deployment/postgres \
  -- sh -c 'psql \
    --username="$POSTGRES_USER" \
    --dbname=skkuding \
    --command="ANALYZE;"'
```

### 7.6 트래픽 재개

- API를 기동하고 health check가 성공하는지 확인합니다.
- 로그인, 프로젝트 조회 등 핵심 읽기 기능을 확인합니다.
- 제한된 쓰기 요청 한 건을 검증한 뒤 정상 트래픽을 재개합니다.
- 사용한 백업 객체, 복구 시간, 검증 결과와 작업자를 장애 기록에 남깁니다.
