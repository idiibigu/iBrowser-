$files = @(
    "en/about.html",
    "en/anydesk-support.html",
    "en/contact.html",
    "en/hostinger-promo.html",
    "en/projects.html"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Define the pattern to search for
    $oldPattern = '                <!-- Main Navigation -->
                <nav class="main-nav">
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a class="nav-link[^>]*>Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link[^>]*>Services</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link[^>]*>About Us</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link[^>]*>Projects</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link[^>]*>Contact</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link[^>]*>Remote Support</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link[^>]*>Hostinger Hosting</a>
                        </li>
                    </ul>'
    
    # Define the replacement
    $newPattern = '                <!-- Main Navigation -->
                <nav class="main-nav">
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a class="nav-link" href="index.html">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="services.html">Services</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="about.html">About Us</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="projects.html">Projects</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="contact.html">Contact</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="anydesk-support.html">Remote Support</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="hostinger-promo.html">Hostinger Hosting</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="idiibi-meaning.html">idiibi Meaning</a>
                        </li>
                    </ul>'
    
    # Update the active class based on the file name
    $fileBaseName = [System.IO.Path]::GetFileNameWithoutExtension($file)
    
    if ($fileBaseName -eq "about") {
        $newPattern = $newPattern -replace '<a class="nav-link" href="about.html">About Us</a>', '<a class="nav-link active" href="about.html">About Us</a>'
    }
    elseif ($fileBaseName -eq "anydesk-support") {
        $newPattern = $newPattern -replace '<a class="nav-link" href="anydesk-support.html">Remote Support</a>', '<a class="nav-link active" href="anydesk-support.html">Remote Support</a>'
    }
    elseif ($fileBaseName -eq "contact") {
        $newPattern = $newPattern -replace '<a class="nav-link" href="contact.html">Contact</a>', '<a class="nav-link active" href="contact.html">Contact</a>'
    }
    elseif ($fileBaseName -eq "hostinger-promo") {
        $newPattern = $newPattern -replace '<a class="nav-link" href="hostinger-promo.html">Hostinger Hosting</a>', '<a class="nav-link active" href="hostinger-promo.html">Hostinger Hosting</a>'
    }
    elseif ($fileBaseName -eq "projects") {
        $newPattern = $newPattern -replace '<a class="nav-link" href="projects.html">Projects</a>', '<a class="nav-link active" href="projects.html">Projects</a>'
    }
    
    # Replace the pattern in the content
    $newContent = $content -replace $oldPattern, $newPattern
    
    # Write the updated content back to the file
    Set-Content $file $newContent
    
    Write-Host "Updated $file"
}

Write-Host "All files have been updated."
