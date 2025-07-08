# Deploy fullstack

(From yesterday...)
- Tasks revisited
- File uploading Risks 
    Please discuss common security concerns with file uploads:
     - file type/size limit (allow specific types such as .jpg or .png, avoid excessively large files)
     - rename files (avoid name collisions)
     - avoid executable files (e.g. `.exe`, `.php`) - dangerous!
        - we can already filter files in frontend (image files only)
        - potentially risky files such as .svg can be filtered in backend using multer



## Today, we will be deploying our fullstack album app using render

- This project combines both frontend and backend into a **single** deployment.

- By deploying the backend, the frontend is automatically deployed as well, since it’s bundled inside.
    - Expresses uses `express.static()` to serve those static files 
    - Fewer CORS issues, since we are using the same origin 
    - We use `path.join()` with `__dirname` (from the Node.js module) to build the absolute path to the frontend's build folder(dist).
        - This is also important when we access the image files stored in it
    
- Catch-all handler for client-side routing
    - When a route is accessed, Express looks for a matching backend route. If none is found, it returns a 404 error.
    - However, React uses client-side routing (e.g., /about), which isn’t handled by Express.
    - This means direct access to frontend routes (e.g., refreshing the page on /about) would otherwise break. 
    - The catch-all ensures every route loads `index.html`, letting react take over and render the page properly.

