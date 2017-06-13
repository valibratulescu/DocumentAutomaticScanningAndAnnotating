import {
    Template
} from 'meteor/templating';
import {
    Session
} from 'meteor/session';

import './main.html';

if (Meteor.isClient) {
    Session.keys = {};
    
    Template.processPhoto.events({
        'click .take-photo': function() {
            var cameraOpts = {
                quality: 100,
                width: -1,
                height: -1,
            };

            var callback = function(error, data) {
                if (error)
                    Session.set('error_taking_photo', error);

                if (data)
                    Session.set('test', data);
            };

            MeteorCamera.getPicture(cameraOpts, callback);
        },
        'click .choose-photo': function() {
            var cameraOpts = {
                quality: 100,
                width: -1,
                height: -1,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            };

            var callback = function(error, data) {
                if (error)
                    Session.set('error_choosing_photo', error);

                if (data)
                    Session.set('test', data);
            };

            MeteorCamera.getPicture(cameraOpts, callback);
        },
        'click .process-photo': function() {
        	var photo = Session.get('test') || '';

            if (photo === '') {
                alert('No photo selected!');

                return;
            }

            Meteor.call('processFile', photo, function (error, data) {
                if (data.status === 'success') {
                    Session.set('file_processed', true);
                } else {
                    Session.set('file_processed', false);
                }
                alert(data.data);
			});
        },
        'click .view-content': function() {
            Meteor.call('getContent', function (error, data) {
                alert(data.data);
            })
        },
        'click .generate-pdf': function() {
            Meteor.call('generatePDF', function(error, data) {
                alert(data.data);
            })
        },
        'click .send-to-sugar': function() {
            Meteor.call('performSugarRequest', function(error, data) {
                alert(data.data);
            })
        },
    });
    Template.processPhoto.helpers({
        'photo': function() {
            return Session.get('test');
        },
        'error': function() {
            return Session.get('error');
        },
        'file_processed': function() {
            return Session.get('file_processed');
        },
    });
}