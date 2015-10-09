"use strict";

var aws = require('aws-sdk');
var async = require('async');
var util = require('util');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var sesTransport = require('nodemailer-ses-transport');

var emailHtml = "";
emailHtml += "<!DOCTYPE html PUBLIC \"-\/\/W3C\/\/DTD XHTML 1.0 Transitional\/\/EN\"";
emailHtml += "\"http:\/\/www.w3.org\/TR\/xhtml1\/DTD\/xhtml1-transitional.dtd\">";
emailHtml += "<html xmlns=\"http:\/\/www.w3.org\/1999\/xhtml\">";
emailHtml += "  <head>";
emailHtml += "      <meta http-equiv=\"Content-Type\" content=\"text\/html; charset=us-ascii\" \/>";
emailHtml += "      <title>Tilde New Music and Sound Art<\/title>";
emailHtml += "      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" \/>";
emailHtml += "  <\/head>";
emailHtml += "  <body style=\"margin:0;padding:0;\">";
emailHtml += "      <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=";
emailHtml += "          \"margin:0;padding:0;background-image:url('http:\/\/www.tilde.net.au\/wp-content\/themes\/travelify\/images\/background.png');\">";
emailHtml += "          <tr>";
emailHtml += "              <td align=\"center\">";
emailHtml += "                  <table width=\"100%\" style=";
emailHtml += "                      \"width:100%;max-width:900px; background-color: #fff; padding: 40px 30px;\" bgcolor=\"#FFFFFF\">";
emailHtml += "                      <tr bgcolor=\"#FFFFFF\">";
emailHtml += "                          <td><a href=\"http:\/\/www.tilde.net.au\/\"><img src=";
emailHtml += "                              \"http:\/\/www.tilde.net.au\/wp-content\/uploads\/2015\/01\/header1018-012.jpg\" alt=";
emailHtml += "                              \"Tilde new music and sound art\" style=";
emailHtml += "                          \"display:block;width:100%;max-width:900px;\" \/><\/a><\/td>";
emailHtml += "                      <\/tr>";
emailHtml += "                  <\/table>";
emailHtml += "              <\/td>";
emailHtml += "          <\/tr>";
emailHtml += "          <tr>";
emailHtml += "              <td align=\"center\">";
emailHtml += "                  <table  border=\"0\" cellpadding=\"10\" cellspacing=\"0\" style=";
emailHtml += "                      \"width:100%;max-width:900px;background-color:#fff;text-align:left;\"";
emailHtml += "                      bgcolor=\"#FFFFFF\">";
emailHtml += "                      <tr>";
emailHtml += "                          <td align=\"center\">";
emailHtml += "                              <h1 style=";
emailHtml += "                              \"font-family:monospace;font-size:14pt;font-weight:bold;margin-bottom:20px;\">";
emailHtml += "                              Confirmation<\/h1>";
emailHtml += "                          <\/td>";
emailHtml += "                      <\/tr>";
emailHtml += "                      <tr>";
emailHtml += "                          <td>";
emailHtml += "                              <p style=\"font-family: monospace;color:#000;margin-left:40px\">Hi,<\/p>";
emailHtml += "                              <p style=\"font-family: monospace;color:#000;margin-left:40px\">Your fixed media submission has been successfully uploaded.<\/p>";
emailHtml += "                              <p style=\"font-family: monospace;color:#000;margin-left:40px\">Thank you,<br \/>";
emailHtml += "                              The Tilde team<\/p>";
emailHtml += "                          <\/td>";
emailHtml += "                      <\/tr>";
emailHtml += "                  <\/table>";
emailHtml += "              <\/td>";
emailHtml += "          <\/tr>";
emailHtml += "          <tr>";
emailHtml += "              <td align=\"center\">";
emailHtml += "                  <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=";
emailHtml += "                      \"width:100%;max-width:900px;\">";
emailHtml += "                      <tr bgcolor=\"#FFFFFF\" style=\"padding:0;margin:0\">";
emailHtml += "                          <td><img src=\"http:\/\/www.tilde.net.au\/wp-content\/uploads\/2013\/11\/Tilde-sonogram-e1406539567234.jpg\" style=\"width:100%;max-width:900px;\" \/><\/td>";
emailHtml += "                      <\/tr>";
emailHtml += "                  <\/table>";
emailHtml += "              <\/td>";
emailHtml += "          <\/tr>";
emailHtml += "      <\/table>";
emailHtml += "  <\/body>";
emailHtml += "<\/html>";

var emailText = ""

emailText += "( http:\/\/www.tilde.net.au\/ )\n"
emailText += "\n"
emailText += "************\n"
emailText += "Confirmation\n"
emailText += "************\n"
emailText += "\n"
emailText += "Hi,\n"
emailText += "\n"
emailText += "Your fixed media submission has\n"
emailText += "been successfully uploaded.\n"
emailText += "\n"
emailText += "Thank you,\n"
emailText += "\n"
emailText += "The Tilde team"

var SubmissionNotifier = function (config, s3) {

    var defaultMailOptions = {
        "from" : config.defaultEmailFrom,
        "to" : config.defaultEmailTo,
        "subject" : config.defaultEmailSubject,
        "text" : config.defaultEmailText,
    };

    var sesOptions = {
        accessKeyId: config.SES_STMP_USERNAME,
        secretAccessKey: config.SES_SMTP_PASSWORD,
        region: config.AWS_REGION,
    };

    var validateEvent = function (event) {
        return function (next) {
            var bucketName = event.Records[0].s3.bucket.name;
            var key = event.Records[0].s3.object.key.replace('%40', '@'); // Keys contain values, Ex. '@' which may be encoded

            var re = /(^uploads\/.*\/)/;
            var enclosingFolder = re.exec(key)[0];

            s3.getObject(
            {
                Bucket: bucketName, Key: decodeURIComponent(key)
            },
            function (err, data) {
                if (err) {
                    next('Error: Failed to get object ' + key + ' from bucket ' + bucketName + '. Make sure it exists and your bucket is in the same region as this function. \n' + err);
                } else {
                    var prefix = key.substr(0, config.submissionsKeyPrefix.length);
                    if (prefix === config.submissionsKeyPrefix) { // Only process keys with this prefix
                        var filename = key.substr(key.lastIndexOf('/') + 1);
                        console.log('Filename: ', filename);
                        // console.log('Email: ', data.Metadata[config.emailMetaKey]);
                        console.log('Key: ' + key);
                        console.log('Content Type: ', data.ContentType);
                        next(null, key);  
                    } else {
                        next('The object key: ' + key + ' is not valid for this process');
                    }
                }
            });
        };
    };

    var sendEmail = function (key, next) {

        var email;

        var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

        var emailAddress = re.exec(key)[0].substr(22);

        if (emailAddress) {
            email = emailAddress;
        } else {
            email = config.defaultEmailFrom;
        }

        console.log('Extracted email: ' + email);

        var mailOptions = {
            "from" : defaultMailOptions.from,
            "to" : email,
            "subject" : "Tilde Fixed Media Submission",
            "text" : emailText,
            "html" : emailHtml,
        };

        var transporter = nodemailer.createTransport(sesTransport(sesOptions));
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                next('Error: Sending email failed: ' + err, null);
            } else {
                console.log('Sending message.. info:' + info);
                next(null, info.response);
            }
        });
    };

    return {
        validateEvent: validateEvent,
        sendEmail: sendEmail,
    };
};

exports.handler = function (event, context) {

    var config = require('./config.js');
    var s3 = new aws.S3({apiVersion: config.AWS_API_VERSION});
    var app = new SubmissionNotifier(config, s3);
    console.log('Received event:\n', util.inspect(event, {depth: 5}));

    async.waterfall(
        [
            app.validateEvent(event),
            app.sendEmail,
        ],
        function (err, result) {
            if (err) {
                console.error(err);
            } else {
                console.log('Processes completed successfully: ' + result);
            }
            context.done();
        }   
    );
};
