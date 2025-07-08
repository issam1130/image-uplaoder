# File upload basic

 - Today, we will use a tool called `multer` & upload files
    - [multer](https://expressjs.com/en/resources/middleware/multer.html)
    - multer is a middleware for Node.js used to handle multipart/form-data, primarily for file uploads
    - It’s commonly used in Express-based applications to handle file input from forms


- Live coding: Fullstack Album App

    - Backend: 
        - Multer configuration for handling image uploads
        - GET, "/albums" fetch all albums
        - POST, "/add" add an album with an image upload
        - DELETE, "/delete/:id" delete the album by id
        - PATCH, "/update/:id" get the album by id & update its jacket (image)

    - Frontend:
        - For file upload, we use a `FormData`
          [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
            - built-in browser API
            - append key-value pairs of form fields & files
            - send via fetch      

    - Whole Flow: 
        1. The frontend creates a `FormData` object, including the image file.
        2. A fetch request sends this data to the backend
        3. The backend route (/add or /update/:id) uses multer middleware (before the route handler) and does the following
            - parses incoming formData
            - stores the uploaded file on disk
            - makes the file accessible via `req.file` 
        4. A route handler (after multer middleware) saves the file name into the database as well as other data
        5. The request is completed by returning a response

- File uploading Risks 
    Please discuss common security concerns with file uploads:
     - file type/size limit (allow specific types such as .jpg or .png, avoid excessively large files)
     - rename files (avoid name collisions)
     - avoid executable files (e.g. `.exe`, `.php`) - dangerous!

## Exercise 
    - Define the update route "/update/:id", HTTP PATCH
    - Chain a multer middleware, so we can store an incoming file and get an access to it
    - Update the album jacket ( "/update/:id")
        - find the album to update by ID from `req.params` and
        - update the jacket according to the `req.file`'s file name
        - send a response with the updated object
    - Frontend: update the function `handleUpdate()` in `Album.jsx`

### We will be deploying the app tomorrow. Please create a new repo on your github account and link this repo to it! 