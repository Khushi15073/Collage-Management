export enum GeneralMessages {
  FetchSuccessful = "Fetch Successful",
  CreateSuccessful = "New record added successfully",
  UpdateSuccessful = "Record Updated successfully",
  DeleteSuccessful = "Record Deleted successfully",
  RecordDetailsSaved = "Record details saved successfully",
}

export enum ValidationMessages {
  EmailAndPasswordRequired = "Email and password are required",
  InvalidCredentials = "Incorrect username or password. Please try again.!",
  Unauthorized = "Unauthorized",
  Forbidden = "Forbidden",
  InvalidRefreshToken = "Invalid RefreshToken",
}

export enum ErrorMessages {
  InternalServerError = "Internal Server Error",
  UnknownError = "An unknown error occurred",
  Unauthorized = "Unauthorized",
  InvalidRequest = "Invalid Request",
  MISSING_REQUIRED_PARAMETERS = "Missing required transaction parameters.",
}

export enum PermissionMessages {
  PermissionNotFound = "Privilege Not Found",
  PermissionDeleted = "Privilege deleted successfully.",
  PermissionCreated = "New privilege added successfully.",
  PermissionsFetched = "Privileges successfully fetched",
  PermissionAlreadyExists = "Privilege already Exists",
  PermissionUpdated = "Privilege updated successfully.",
  RoutesAssigned = "Routes Assigned successfully",
}

export enum UserMessages {
  PhoneNumberNotFound = "Phone number not found",

  UserNotFound = "Incorrect username or password. Please try again.",
  LoginSuccessful = "Welcome back! You're logged in.",
  RefreshTokenSuccessful = "Refresh Token Successful",
  AlreadyLoggedOut = "You have been already logged out.",
  LogoutFailed = "Logout failed.",
  LogoutSuccessful = "You have been logged out successfully.",
  UserAlreadyExits = "User Aleady Exits",
  UserNotVerified = "User Not Verified",
}

export enum RoleMessages {
  RoleUpdated = "Role updated successfully.",
  RoleNotFound = "Role Not Found",
  RoleAlreadyExists = "Role Alredy Exists",
  RoleCreated = "New role added successfully.",
  RolesFetched = "Roles Fetched",
  RoleFetched = "Role Fetched",
  RoleAssociatedWithUser = "Can not delete Role is associated with user",
  RoleDeleted = "Role deleted successfully.",
}

export enum AuthErrors {
  InvalidEmail = "Please enter a valid email address",
  InvalidPassword = "Incorrect username or password. Please try again.",
  InvalidRefreshToken = "Invalid refresh token",
  InvalidMobileNumber = "Please enter a valid mobile number",
  EmailRequired = "Email is required",
  PasswordRequired = "Password is required",
  MobileNumberRequired = "Mobile number is required",
}
