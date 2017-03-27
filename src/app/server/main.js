import {
    Meteor
} from 'meteor/meteor';

import fs from 'fs';

Meteor.startup(() => {
    Meteor.methods({
	    sendPhotoToServer: function() {
	    	var photo = arguments[0].replace('data:image/jpeg;base64,', '');
	    	var currentDate = new Date();
	    	var fileName = 'img-' + currentDate.toJSON() + '.jpg';

	    	var fileName = 'out.jpg';

	    	fs.writeFile(fileName, photo, 'base64', Meteor.call('processFile', fileName));
			
	    },

	    processFile: function(file) {
	    	console.log(file);
	    }
	});
});