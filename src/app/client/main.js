import {
    Template
} from 'meteor/templating';
import {
    Session
} from 'meteor/session';

import './main.html';

if (Meteor.isClient) {
    Template.processPhoto.events({
        'click .take-photo': function() {
            MeteorCamera.getPicture({
            }, function(error, data) {
            	Session.set('photo', data);
            	Session.set('error', error);
            });
        },
        'click .view-galery': function() {
            MeteorCamera.getPicture({
            	quality: 100,
            	width: -1,
            	height: -1,
            	sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            }, function(error, data) {
                Session.set('photo', data);
            	Session.set('error', error);
            });
        },
        'click .send-to-server': function() {
        	var photo = Session.get('photo') || '';

            Meteor.call('sendPhotoToServer', photo, function (error, data) {
			});
        }
    });
    Template.processPhoto.helpers({
        'photo': function() {
            return Session.get('photo');
        },
        'error': function() {
            return Session.get('error');
        },
    });
}