# Get files from git index
$files = git ls-files images

foreach ($file in $files) {
    # Check if file has upper case characters
    if ($file -cmatch '[A-Z]') {
        $lower = $file.ToLower()
        Write-Host "Renaming $file -> $lower"
        
        # Move to tmp
        git mv "$file" "${file}_tmp"
        
        # Move to lowercase
        git mv "${file}_tmp" "$lower"
    }
}
