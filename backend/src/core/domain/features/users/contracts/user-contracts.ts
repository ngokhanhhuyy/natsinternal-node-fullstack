export class UserContracts {
  public userNameMinLength: number = 6;
  public userNameMaxLength: number = 20;
  public passwordMinLength: number = 8;
  public passwordMaxLength: number = 20;
  public passwordHashMaxLength: number = 255;
  public profilePictureUrlMaxLength: number = 255;

  private constructor() { }
}