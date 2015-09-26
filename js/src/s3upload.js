function uploadFile(file, name, email, kind) {
    var fd = new FormData();

    console.log("Upload");

    var key = "uploads/" + email + "_" + name + "/${filename}";


    // Populate the Post paramters.
    fd.append('key', key);
    fd.append('AWSAccessKeyId', 'AKIAJSK33JUGBWFOZ2YQ');
    fd.append('acl', 'private');
    fd.append('policy', "eyJleHBpcmF0aW9uIjogIjIwMTYtMjQtMDFUMDA6MDA6MDBaIiwgICJjb25kaXRpb25zIjogWyAgICAgeyJidWNrZXQiOiAidGlsZGUtZml4ZWQtbWVkaWEifSwgICAgIFsic3RhcnRzLXdpdGgiLCAiJGtleSIsICJ1cGxvYWRzLyJdLCAgICB7ImFjbCI6ICJwcml2YXRlIn0sICAgIFsic3RhcnRzLXdpdGgiLCAiJENvbnRlbnQtVHlwZSIsICIiXSwgIF19");
    fd.append('signature', "JLFiA+Z+jPSNsS0DHHAXKIu5/Cc=");
    fd.append('content-type', '');
    fd.append("file", file);

    var xhr = new XMLHttpRequest();

    var progressBar = document.getElementById('progress-bar-' + kind);

    xhr.upload.addEventListener("progress", function(evt) {
        if (evt.lengthComputable) {
            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
            progressBar.innerHTML = "<p>" + percentComplete.toString() + '%</p>';
            progressBar.style.width = percentComplete.toString() + '%';
        } else {
            progressBar.innerHTML = "<p>unable to compute</p>";
        }
    }, false);

    xhr.addEventListener("load", function(evt) {
        /* This event is raised when the server send back a response */
        progressBar.innerHTML = "<p>Done! " + evt.target.responseText + "</p>";
    }, false);

    xhr.addEventListener("error", function(evt) {
        progressBar.innerHTML = "<p>There was an error attempting to upload the file." + evt + "</p>";
    }, false);

    xhr.addEventListener("abort", function uploadCanceled(evt) {
        progressBar.innerHTML = "<p>The upload has been cancelled by the user or the browser dropped the connection.</p>";
    }, false);

    xhr.open('POST', 'https://tilde-fixed-media.s3.amazonaws.com/', true); //MUST BE LAST LINE BEFORE YOU SEND 

    xhr.send(fd);
}

function submit() {
    var soundfile = document.getElementById('soundfile').files[0];
    var biofile = document.getElementById('biofile').files[0];
    var name = document.getElementById('name').value.replace(/ /g, '-');
    var email = document.getElementById('email').value;

    console.log($("#media-upload-form").validate());

    // if ($("#media-upload-form").validate()) {
      // console.log("valid form");
      uploadFile(soundfile, name, email, "sound");
      uploadFile(biofile, name, email, "bio");
    // };
};