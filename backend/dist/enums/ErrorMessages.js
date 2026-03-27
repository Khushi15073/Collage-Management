"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthErrors = exports.RoleMessages = exports.UserMessages = exports.PermissionMessages = exports.ErrorMessages = exports.ValidationMessages = exports.GeneralMessages = void 0;
var GeneralMessages;
(function (GeneralMessages) {
    GeneralMessages["FetchSuccessful"] = "Fetch Successful";
    GeneralMessages["CreateSuccessful"] = "New record added successfully";
    GeneralMessages["UpdateSuccessful"] = "Record Updated successfully";
    GeneralMessages["DeleteSuccessful"] = "Record Deleted successfully";
    GeneralMessages["RecordDetailsSaved"] = "Record details saved successfully";
})(GeneralMessages || (exports.GeneralMessages = GeneralMessages = {}));
var ValidationMessages;
(function (ValidationMessages) {
    ValidationMessages["EmailAndPasswordRequired"] = "Email and password are required";
    ValidationMessages["InvalidCredentials"] = "Incorrect username or password. Please try again.!";
    ValidationMessages["Unauthorized"] = "Unauthorized";
    ValidationMessages["Forbidden"] = "Forbidden";
    ValidationMessages["InvalidRefreshToken"] = "Invalid RefreshToken";
})(ValidationMessages || (exports.ValidationMessages = ValidationMessages = {}));
var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["InternalServerError"] = "Internal Server Error";
    ErrorMessages["UnknownError"] = "An unknown error occurred";
    ErrorMessages["Unauthorized"] = "Unauthorized";
    ErrorMessages["InvalidRequest"] = "Invalid Request";
    ErrorMessages["MISSING_REQUIRED_PARAMETERS"] = "Missing required transaction parameters.";
})(ErrorMessages || (exports.ErrorMessages = ErrorMessages = {}));
var PermissionMessages;
(function (PermissionMessages) {
    PermissionMessages["PermissionNotFound"] = "Privilege Not Found";
    PermissionMessages["PermissionDeleted"] = "Privilege deleted successfully.";
    PermissionMessages["PermissionCreated"] = "New privilege added successfully.";
    PermissionMessages["PermissionsFetched"] = "Privileges successfully fetched";
    PermissionMessages["PermissionAlreadyExists"] = "Privilege already Exists";
    PermissionMessages["PermissionUpdated"] = "Privilege updated successfully.";
    PermissionMessages["RoutesAssigned"] = "Routes Assigned successfully";
})(PermissionMessages || (exports.PermissionMessages = PermissionMessages = {}));
var UserMessages;
(function (UserMessages) {
    UserMessages["PhoneNumberNotFound"] = "Phone number not found";
    UserMessages["UserNotFound"] = "Incorrect username or password. Please try again.";
    UserMessages["LoginSuccessful"] = "Welcome back! You're logged in.";
    UserMessages["RefreshTokenSuccessful"] = "Refresh Token Successful";
    UserMessages["AlreadyLoggedOut"] = "You have been already logged out.";
    UserMessages["LogoutFailed"] = "Logout failed.";
    UserMessages["LogoutSuccessful"] = "You have been logged out successfully.";
    UserMessages["UserAlreadyExits"] = "User Aleady Exits";
    UserMessages["UserNotVerified"] = "User Not Verified";
})(UserMessages || (exports.UserMessages = UserMessages = {}));
var RoleMessages;
(function (RoleMessages) {
    RoleMessages["RoleUpdated"] = "Role updated successfully.";
    RoleMessages["RoleNotFound"] = "Role Not Found";
    RoleMessages["RoleAlreadyExists"] = "Role Alredy Exists";
    RoleMessages["RoleCreated"] = "New role added successfully.";
    RoleMessages["RolesFetched"] = "Roles Fetched";
    RoleMessages["RoleFetched"] = "Role Fetched";
    RoleMessages["RoleAssociatedWithUser"] = "Can not delete Role is associated with user";
    RoleMessages["RoleDeleted"] = "Role deleted successfully.";
})(RoleMessages || (exports.RoleMessages = RoleMessages = {}));
var AuthErrors;
(function (AuthErrors) {
    AuthErrors["InvalidEmail"] = "Please enter a valid email address";
    AuthErrors["InvalidPassword"] = "Incorrect username or password. Please try again.";
    AuthErrors["InvalidRefreshToken"] = "Invalid refresh token";
    AuthErrors["InvalidMobileNumber"] = "Please enter a valid mobile number";
    AuthErrors["EmailRequired"] = "Email is required";
    AuthErrors["PasswordRequired"] = "Password is required";
    AuthErrors["MobileNumberRequired"] = "Mobile number is required";
})(AuthErrors || (exports.AuthErrors = AuthErrors = {}));
