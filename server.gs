function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('form.html');
}

function uploadFiles(form) {
  
  try {
    
    var dropbox         = "Fixed Media Submissions";

    // Vince: Create a spreadsheet with these columns: Name, Email, Sound File URL, PDF Bio URL

    // Place the spreadsheet ID in this variable.
    var spreadsheetId   = "1rsnkohfEo7WwzYzeEaFK6ykNvV9duRMwLQQWhuqtfwQ"; 

    var spreadsheet     = SpreadsheetApp.openById(spreadsheetId);

    var folder, folders = DriveApp.getFoldersByName(dropbox);
    
    var name            = form.name;
    var email           = form.email;
    
    if (folders.hasNext()) {
      folder            = folders.next();
    } else {
      folder            = DriveApp.createFolder(dropbox);
    }

    var soundBlob       = form.sound;
    var pdfBioBlob      = form.pdfBio;

    var soundFile       = folder.createFile(soundBlob);
    var pdfBioFile      = folder.createFile(pdfBioBlob);

    soundFile.setDescription("Uploaded by " + form.name + " | " + form.email);
    pdfBioFile.setDescription("Uploaded by " + form.name + " | " + form.email);

    var soundFileURL   = soundFile.getName();
    var pdfBioFileURL  = pdfBioFile.getName();

    spreadsheet.appendRow(
      [name, 
      email, 
      soundFileURL, 
      pdfBioFileURL
    ]);
        
    return "Your submission has been successfully uploaded.";
    
  } catch (error) {
    
    return error.toString();
  }
  
}