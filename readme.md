# Routes Documentation

# User Routes

## Login

- **Method**: POST
- **URL**: api/v1/user/login
- **Description**: Authenticate user credentials and generate JWT token for login.
- **Request Body**:
  - `email`: User's email address.
  - `password`: User's password.
- **Validation**:
  - `email`: Required. Must be a valid email address.
  - `password`: Required. Must be a minimum of 8 characters.

## Signup

- **Method**: POST
- **URL**: api/v1/user/signup
- **Description**: Register a new user account.
- **Request Body**:
  - `firstName`: User's first name.
  - `lastName`: User's last name.
  - `email`: User's email address.
  - `password`: User's password.
  - `confirmPassword`: Confirmation of the user's password.
- **Validation**:
  - `firstName`: Required.
  - `lastName`: Required.
  - `email`: Required. Must be a valid email address.
  - `password`: Required. Must be a minimum of 8 characters.
  - `confirmPassword`: Required. Must match the `password` field.

## Get User Articles

- **Method**: GET
- **URL**: api/v1/user/:id/articles
- **Description**: Retrieve articles authored by a specific user.
- **Parameters**:
  - `id`: The unique identifier of the user.

# Article Routes

## Get All Published Articles

- **Method**: GET
- **URL**: /api/v1/articles
- **Description**: Returns all published blog articles.

## Get One Published Article

- **Method**: GET
- **URL**: /api/v1/articles/:id
- **Description**: Returns a published blog article.
- **Parameters**:
  - `id`: The unique identifier of the article.

## Create a New Blog Article

- **Method**: POST
- **URL**: /api/v1/articles/create
- **Description**: Create a new blog article.
- **Authentication**: Requires JWT authentication.
- **Request Body**:
  - `title` : Title of the article.
  - `description` : Description of the article.
  - `body` : Body content of the article.
  - `tags` : Tags associated with the article.
- **Validation**:
  - `title`: Required.
  - `description`: Required.
  - `body`: Required.
  - `tags`: Required.

## Update an Article

- **Method**: PATCH
- **URL**: /api/v1/articles/:id
- **Description**: Update an article.
- **Authentication**: Requires JWT authentication.
- **Parameters**:
  - `id`: The unique identifier of the article.
- **Request Body**:
  - `title` (optional): Title of the article.
  - `description` (optional): Description of the article.
  - `body` (optional): Body content of the article.
  - `tags` (optional): Tags associated with the article.
  - `state` (optional): The state of the article.
- **Validation**:
  - `state`: Must be either 'draft' or 'published'.

## Delete an Article

- **Method**: DELETE
- **URL**: /api/v1/articles/:id
- **Description**: Delete an article.
- **Authentication**: Requires JWT authentication.
- **Parameters**:
  - `id`: The unique identifier of the article.
