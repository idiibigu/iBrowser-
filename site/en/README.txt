# English Version Implementation Guide

This file provides instructions on how to complete the English version of the website.

## Completed Files
- index.html - English version completed
- about.html - English version completed

## Files to be Completed
The following files need to be translated to English following the same pattern:
- services.html
- contact.html
- projects.html

## Translation Steps for Each File

1. Change the HTML language and direction:
   ```html
   <html lang="en" dir="ltr" data-bs-theme="dark">
   ```

2. Update the page title to English

3. Change Bootstrap CSS from RTL to standard:
   ```html
   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
   ```

4. Update CSS paths to point to parent directory:
   ```html
   <link rel="stylesheet" href="../css/style.css">
   ```

5. Add multilingual CSS support:
   ```html
   <link rel="stylesheet" href="../css/multilingual.css">
   ```

6. Update the loading screen text to "Loading..."

7. Update image paths to point to parent directory:
   ```html
   <img src="../icons/icon-192x192.png" alt="idiibi Logo" class="logo-image">
   ```

8. Update the header navigation with English text:
   - Home
   - Services
   - About Us
   - Projects
   - Contact

9. Update the language switch button to point to the Arabic version:
   ```html
   <a href="../index.html" class="lang-switch" id="lang-switch">AR</a>
   ```

10. Translate all content text to English

11. Update the footer with English text

12. Update JavaScript paths to point to parent directory:
    ```html
    <script src="../js/new-header.js"></script>
    ```

## Language Switching Functionality
The language switching functionality is implemented in the new-header.js file. It stores the user's language preference in localStorage and redirects to the appropriate version when the user visits the site again.
