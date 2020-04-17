# User Auth
A complete authentication system which can be used as a starter code for creating any new application.

#### Setup the Project

1. Clone or Download the Repo.
2. `cd user-auth` goto the Repo using Terminal.
3. Put the Gmail Account Details in `./config/nodemailer.js` for Email Services. 
4. Run `mongod` to start the MongoDB Database.
5. Run `npm start` to ignite the project.

#### Routes
1. **Homepage:** `http://localhost:8000/`
2. **Sign Up:** `http://localhost:8000/users/sign-up`
3. **Sign In:** `http://localhost:8000/users/sign-in`
4. **Forgot Password:** `http://localhost:8000/users/forgot-password`
5. **Reset Password:** `http://localhost:8000/users/reset/:emailed-token-id`
6. **Dashboard:** `http://localhost:8000/users/dashboard`