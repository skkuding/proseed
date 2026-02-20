export class AuthenticatedUser {
  #id: number
  #email: string

  constructor(id: number, email: string) {
    this.#id = id
    this.#email = email
  }

  get id() {
    return this.#id
  }

  get email() {
    return this.#email
  }
}
