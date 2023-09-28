# Natours
Natours is a simple tour API and server side rendered website!
Built to learn backend web development!

## Technologies
- Nodejs
- Express.js
- MongoDB
- Mongoose
- Pug.js

## Description

Natours is an API built organize tour information in a NoSQL database with advanced authentication and authorization involving multiple user roles.
Server side rendered website to access API Features is available!


# Natours API Endpoints
- Filtering, sorting, limiting fields and pagination all implemented on any endpoint that returns multiple objects!
## Tours
Get all tours stored in the database
```http
GET /api/v1/tours
```
**AUTHORIZATION REQUIRED**   
*admin or lead guide*  
Create a new tour sending the data in JSON form
```http
POST /api/v1/tours
```
Get a certain tour
```http
GET /api/v1/tours/:id
```
| Parameter | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| `id`      | `string` | **Required**. ID of the tour in the database |

**AUTHORIZATION REQUIRED**   
*admin or lead guide*   
Update and existing tour sending the data in JSON form
```http
PATCH /api/v1/tours/:id
```
| Parameter | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| `id`      | `string` | **Required**. ID of the tour in the database |

**AUTHORIZATION REQUIRED**   
*admin or lead guide*   
Delete an already existing tour
```http
DELETE /api/v1/tours/:id
```
| Parameter | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| `id`      | `string` | **Required**. ID of the tour in the database |

Get the top 5 cheapest tours
```http
GET /api/v1/top-5-cheap
```
Get tours stats broken into difficulties
```http
GET /api/v1/top-5-cheap
```
**AUTHORIZATION REQUIRED**   
*admin, lead guide or guide*   
Get monthly stats based on a specific year
```http
GET /api/v1/tours/monthly-plan/:year
```
| Parameter | Type     | Description                        |
| :-------- | :------- | :--------------------------------- |
| `year`    | `number` | **Required**. Year to get stats on |

```http
GET /tours-within/:distance/center/:latlng/unit/:unit
```
| Parameter  | Type     | Description                                               |
| :--------- | :------- | :-------------------------------------------------------- |
| `distance` | `number` | **Required**. Max distance from point                     |
| `latlng`   | `number` | **Required**. Longitude and latitude to specify the point |
| `unit`     | `string` | **Required**. Kilometers or miles                         |

Get distances to all tours from a point 
```http
GET /api/v1/tours/distances/:latlng/unit/:unit
```
| Parameter | Type     | Description                                               |
| :-------- | :------- | :-------------------------------------------------------- |
| `latlng`  | `number` | **Required**. Longitude and latitude to specify the point |
| `unit`    | `string` | **Required**. Kilometers or miles                         |

## Users
**AUTHORIZATION REQUIRED**   
*admin*  
Get all user stored in the database
```http
GET /api/v1/users
```
**AUTHORIZATION REQUIRED**   
*admin*  
Create a new user sending the data in JSON form
```http
POST /api/v1/users
```
**AUTHORIZATION REQUIRED**   
*admin*  
Get a certain user
```http
GET /api/v1/users/:id
```
| Parameter | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| `id`      | `string` | **Required**. ID of the user in the database |

**AUTHORIZATION REQUIRED**   
*admin*  
Update and existing tour sending the data in JSON form
```http
PATCH /api/v1/users/:id
```
| Parameter | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| `id`      | `string` | **Required**. ID of the user in the database |

**AUTHORIZATION REQUIRED**   
*admin*  
Delete an already existing user
```http
DELETE /api/v1/users/:id
```
| Parameter | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| `id`      | `string` | **Required**. ID of the user in the database |

**AUTHORIZATION REQUIRED**   
*admin, lead guide, guide or user*  
Get the currently logged user
```http
GET /api/v1/users/me
```
**AUTHORIZATION REQUIRED**   
*admin, lead guide, guide or user*  
Update the currently logged user's information
```http
PATCH /api/v1/users/me
```
**AUTHORIZATION REQUIRED**   
*admin, lead guide, guide or user*  
Delete the currently logged user
```http
DELETE /api/v1/users/me
```

## Authentication 
Sign up sending the user information in JSON format
```http
POST /api/v1/users/login
``` 
Log in sending the user information in JSON format
```http
POST /api/v1/users/login
``` 
Send a forgot your password email to obtain the user's token
```http
POST /api/v1/users/forgot-password
```
Reset the user password using the reset token
```http
PATCH /api/v1/users/reset-password/:token
```
| Parameter | Type     | Description                        |
| :-------- | :------- | :--------------------------------- |
| `token`   | `string` | **Required**. Password reset token |

**AUTHORIZATION REQUIRED**   
*admin, lead guide, guide or user*  
Update current logged in user's password
```http
PATCH /api/v1/users/update-password
```
Send the verification email to the user
```http
POST /api/v1/users/send-verification-email
```
Verify user's email using token
```http
POST /api/v1/users/verify-email/:token
```
| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `token`   | `string` | **Required**. Email verification token |

## Reviews
Get all reviews stored in the database
```http
GET /api/v1/reviews
```
**AUTHORIZATION REQUIRED**   
*user*  
Create a new review sending the data in JSON form
```http
POST /api/v1/reviews
```
Get a certain review
```http
GET /api/v1/reviews/:id
```
| Parameter | Type     | Description                                    |
| :-------- | :------- | :--------------------------------------------- |
| `id`      | `string` | **Required**. ID of the review in the database |

**AUTHORIZATION REQUIRED**   
*admin or user*   
Update and existing review sending the data in JSON form
```http
PATCH /api/v1/reviews/:id
```
| Parameter | Type     | Description                                    |
| :-------- | :------- | :--------------------------------------------- |
| `id`      | `string` | **Required**. ID of the review in the database |

**AUTHORIZATION REQUIRED**   
*admin or user*   
Delete an already existing review
```http
DELETE /api/v1/reviews/:id
```
| Parameter | Type     | Description                                    |
| :-------- | :------- | :--------------------------------------------- |
| `id`      | `string` | **Required**. ID of the review in the database |
