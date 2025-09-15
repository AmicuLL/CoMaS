const apiBaseUrl = "http://localhost:8443"; /*"https://a****.****.***:8443"*/ // URL-ul API-ului

export var APP_CONFIG = {
  //if saved locally: "path/to/image"

  apiBaseUrl,
  sseSubscribeUrl: apiBaseUrl + "/api/v1/notification/subscribe",

  logoPlaceholder: "https://placehold.co/600x400?text=Placeholder",
  avatarPlaceholder:
    "https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png",

  companyLogoUrl:
    "https://upload.wikimedia.org/wikipedia/commons/f/f6/Logo_Universitatea_Tehnic%C4%83_din_Cluj-Napoca.svg", //"https://img.logoipsum.com/243.svg",
  companyAvatarUrl:
    "https://www.utcluj.ro/static/old/img/apple-touch-icon-114x114.png",

  companyAbbreviation: "CoMaS", //"Company Management System", "CompanySuite", "WorkSync", "CoMaApp - Company Managment App"
  companyName: "Company Management System",

  backgroundImageLogin: "../public/images/login.jpg",
  backgroundImageLowResLogin: "../public/images/login_low.jpg",

  backgroundImageRegister: "../public/images/register.jpg",
  backgroundImageLowResRegister: "../public/images/register_low.jpg",

  backgroundImageLandingPage:
    "https://img.goodfon.com/original/1920x1080/1/fa/himalayas-mountains-landscape-nature-hd-4k-hd-wallpaper.jpg",
  backgroundImageLandingPageDay: "../public/images/day.jpg",
  backgroundImageLandingPageNight: "../public/images/night.jpg",

  UnauthorizedError: "../public/images/401Error.jpg",
  MissingError: "../public/images/404Error.png",

  ProductPlaceholder: "../public/images/product-placeholder.jpg",
};

export const ROLES = {
  Employee: "ROLE_EMPLOYEE",
  User: "ROLE_USER",
  Admin: "ROLE_ADMIN",
  Client: "ROLE_CLIENT",
};

export const PERMISSIONS = {
  USER_CREATE: "user:create",
  USER_VIEW: "user:view",
  USER_DELETE: "user:delete",
};
