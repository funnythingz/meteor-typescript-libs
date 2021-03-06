/// <reference path='../meteor.d.ts'/>
/**
* All code below was copied from the examples at http://docs.meteor.com/.
* When necessary, code was added to make the examples work (e.g. declaring a variable
* that was assumed to have been declared earlier)
*/
/*********************************** Begin setup for tests ******************************/
// A developer must declare a var Template like this in a separate file to use this TypeScript type definition file
//interface ITemplate {
//  adminDashboard: Meteor.Template;
//  chat: Meteor.Template;
//}
//declare var Template: ITemplate;
var Rooms = new Meteor.Collection('rooms');
var Messages = new Meteor.Collection('messages');
var Monkeys = new Meteor.Collection('monkeys');

var check = function (str1, str2) {
};

/********************************** End setup for tests *********************************/
/**
* From Core, Meteor.startup section
* Tests Meteor.isServer, Meteor.startup, Collection.insert(), Collection.find()
*/
if (Meteor.isServer) {
    Meteor.startup(function () {
        if (Rooms.find().count() === 0) {
            Rooms.insert({ name: "Initial room" });
        }
    });
}

/**
* From Publish and Subscribe, Meteor.publish section
**/
Meteor.publish("rooms", function () {
    return Rooms.find({}, { fields: { secretInfo: 0 } });
});

Meteor.publish("adminSecretInfo", function () {
    return Rooms.find({ admin: this.userId }, { fields: { secretInfo: 1 } });
});

Meteor.publish("roomAndMessages", function (roomId) {
    check(roomId, String);
    return [
        Rooms.find({ _id: roomId }, { fields: { secretInfo: 0 } }),
        Messages.find({ roomId: roomId })
    ];
});

/**
* Also from Publish and Subscribe, Meteor.publish section
*/
Meteor.publish("counts-by-room", function (roomId) {
    var self = this;
    check(roomId, String);
    var count = 0;
    var initializing = true;
    var handle = Messages.find({ roomId: roomId }).observeChanges({
        added: function (id) {
            count++;
            //      if (!initializing)
            // Todo: Not sure how to define in typescript
            //        self.changed("counts", roomId, {count: count});
        },
        removed: function (id) {
            count--;
            // Todo: Not sure how to define in typescript
            //      self.changed("counts", roomId, {count: count});
        }
    });

    initializing = false;

    // Todo: Not sure how to define in typescript
    //  self.added("counts", roomId, {count: count});
    self.ready();

    self.onStop(function () {
        handle.stop();
    });
});

var Counts = new Meteor.Collection("counts");

Deps.autorun(function () {
    Meteor.subscribe("counts-by-room", Session.get("roomId"));
});

console.log("Current room has " + Counts.findOne(Session.get("roomId")).count + " messages.");

/**
* From Publish and Subscribe, Meteor.subscribe section
*/
Meteor.subscribe("allplayers");

/**
* Also from Meteor.subscribe section
*/
Deps.autorun(function () {
    Meteor.subscribe("chat", { room: Session.get("current-room") });
    Meteor.subscribe("privateMessages");
});

/**
* From Methods, Meteor.methods section
*/
Meteor.methods({
    foo: function (arg1, arg2) {
        check(arg1, String);
        check(arg2, [Number]);

        var you_want_to_throw_an_error = true;
        if (you_want_to_throw_an_error)
            throw new Meteor.Error(404, "Can't find my pants");
        return "some return value";
    },
    bar: function () {
        // .. do other stuff ..
        return "baz";
    }
});

/**
* From Methods, Meteor.call section
*/
Meteor.call('foo', 1, 2, function (error, result) {
});
var result = Meteor.call('foo', 1, 2);

/**
* From Collections, Meteor.Collection section
*/
// DA: I added the "var" keyword in there
var Chatrooms = new Meteor.Collection("chatrooms");
Messages = new Meteor.Collection("messages");

var myMessages = Messages.find({ userId: Session.get('myUserId') }).fetch();

Messages.insert({ text: "Hello, world!" });

Messages.update(myMessages[0]._id, { $set: { important: true } });

var Posts = new Meteor.Collection("posts");
Posts.insert({ title: "Hello world", body: "First post" });

// Couldn't find assert() in the meteor docs
//assert(Posts.find().count() === 1);
/**
* Todo: couldn't figure out how to make this next line work with Typescript
* since there is already a Collection constructor with a different signature
*
var Scratchpad = new Meteor.Collection;
for (var i = 0; i < 10; i++)
Scratchpad.insert({number: i * 2});
assert(Scratchpad.find({number: {$lt: 9}}).count() === 5);
**/
var Animal = function (doc) {
    //  _.extend(this, doc);
};

// DA: I altered this to remove dependencies on Underscore
Animal.prototype = {
    makeNoise: function () {
        console.log(this.sound);
    }
};

// Define a Collection that uses Animal as its document
var Animals = new Meteor.Collection("Animals", {
    transform: function (doc) {
        return new Animal(doc);
    }
});

// Create an Animal and call its makeNoise method
Animals.insert({ name: "raptor", sound: "roar" });
Animals.findOne({ name: "raptor" }).makeNoise(); // prints "roar"

/**
* From Collections, Collection.insert section
*/
// DA: I added the variable declaration statements to make this work
var Lists = new Meteor.Collection('Lists');
var Items = new Meteor.Collection('Lists');

var groceriesId = Lists.insert({ name: "Groceries" });
Items.insert({ list: groceriesId, name: "Watercress" });
Items.insert({ list: groceriesId, name: "Persimmons" });

/**
* From Collections, collection.update section
*/
var Players = new Meteor.Collection('Players');

Template['adminDashboard'].events({
    'click .givePoints': function () {
        Players.update(Session.get("currentPlayer"), { $inc: { score: 5 } });
    }
});

/**
* Also from Collections, collection.update section
*/
Meteor.methods({
    declareWinners: function () {
        Players.update({ score: { $gt: 10 } }, { $addToSet: { badges: "Winner" } }, { multi: true });
    }
});

/**
* From Collections, collection.remove section
*/
Template['chat'].events({
    'click .remove': function () {
        Messages.remove(this._id);
    }
});

// DA: I added this next line
var Logs = new Meteor.Collection('logs');

Meteor.startup(function () {
    if (Meteor.isServer) {
        Logs.remove({});
        Players.remove({ karma: { $lt: -2 } });
    }
});

/***
* From Collections, collection.allow section
*/
Posts = new Meteor.Collection("posts");

Posts.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        return (userId && doc.owner === userId);
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents
        return doc.owner === userId;
    },
    remove: function (userId, doc) {
        // can only remove your own documents
        return doc.owner === userId;
    },
    fetch: ['owner']
});

Posts.deny({
    update: function (userId, docs, fields, modifier) {
        // can't change owners
        return docs.userId = userId;
    },
    remove: function (userId, doc) {
        // can't remove locked documents
        return doc.locked;
    },
    fetch: ['locked']
});

/**
* From Collections, cursor.forEach section
*/
var topPosts = Posts.find({}, { sort: { score: -1 }, limit: 5 });
var count = 0;
topPosts.forEach(function (post) {
    console.log("Title of post " + count + ": " + post.title);
    count += 1;
});

/**
* From Collections, cursor.observeChanges section
*/
// DA: I added this line to make it work
var Users = new Meteor.Collection('users');

var count1 = 0;
var query = Users.find({ admin: true, onlineNow: true });
var handle = query.observeChanges({
    added: function (id, user) {
        count1++;
        console.log(user.name + " brings the total to " + count1 + " admins.");
    },
    removed: function () {
        count1--;
        console.log("Lost one. We're now down to " + count1 + " admins.");
    }
});

// After five seconds, stop keeping the count.
setTimeout(function () {
    handle.stop();
}, 5000);

/**
* From Sessions, Session.set section
*/
Deps.autorun(function () {
    Meteor.subscribe("chat-history", { room: Session.get("currentRoomId") });
});

// Causes the function passed to Deps.autorun to be re-run, so
// that the chat-history subscription is moved to the room "home".
Session.set("currentRoomId", "home");

/**
* From Sessions, Session.get section
*/
// Page will say "We've always been at war with Eastasia"
// DA: commented out since transpiler didn't like append()
//document.body.append(frag1);
// Page will change to say "We've always been at war with Eurasia"
Session.set("enemy", "Eurasia");

/**
* From Sessions, Session.equals section
*/
var value;
Session.get("key") === value;
Session.equals("key", value);

/**
* From Accounts, Meteor.users section
*/
Meteor.publish("userData", function () {
    return Meteor.users.find({ _id: this.userId }, { fields: { 'other': 1, 'things': 1 } });
});

Meteor.users.deny({ update: function () {
        return true;
    } });

/**
* From Accounts, Meteor.loginWithExternalService section
*/
Meteor.loginWithGithub({
    requestPermissions: ['user', 'public_repo']
}, function (err) {
    if (err)
        Session.set('errorMessage', err.reason || 'Unknown error');
});

/**
* From Accounts, Accounts.ui.config section
*/
Accounts.ui.config({
    requestPermissions: {
        facebook: ['user_likes'],
        github: ['user', 'repo']
    },
    requestOfflineToken: {
        google: true
    },
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

/**
* From Accounts, Accounts.validateNewUser section
*/
Accounts.validateNewUser(function (user) {
    if (user.username && user.username.length >= 3)
        return true;
    throw new Meteor.Error(403, "Username must have at least 3 characters");
});

// Validate username, without a specific error message.
Accounts.validateNewUser(function (user) {
    return user.username !== "root";
});

/**
* From Accounts, Accounts.onCreateUser section
*/
Accounts.onCreateUser(function (options, user) {
    var d6 = function () {
        return Math.floor(Math.random() * 6) + 1;
    };
    user.dexterity = d6() + d6() + d6();

    // We still want the default hook's 'profile' behavior.
    if (options.profile)
        user.profile = options.profile;
    return user;
});

/**
* From Passwords, Accounts.emailTemplates section
*/
Accounts.emailTemplates.siteName = "AwesomeSite";
Accounts.emailTemplates.from = "AwesomeSite Admin <accounts@example.com>";
Accounts.emailTemplates.enrollAccount.subject = function (user) {
    return "Welcome to Awesome Town, " + user.profile.name;
};
Accounts.emailTemplates.enrollAccount.text = function (user, url) {
    return "You have been selected to participate in building a better future!" + " To activate your account, simply click the link below:\n\n" + url;
};

/**
* From Templates, Template.myTemplate.helpers section
*/
Template['adminDashboard'].helpers({
    foo: function () {
        return Session.get("foo");
    }
});

/**
* From Match section
*/
var Chats = new Meteor.Collection('chats');

Meteor.publish("chats-in-room", function (roomId) {
    // Make sure roomId is a string, not an arbitrary mongo selector object.
    check(roomId, String);
    return Chats.find({ room: roomId });
});

Meteor.methods({ addChat: function (roomId, message) {
        check(roomId, String);
        check(message, {
            text: String,
            timestamp: Date,
            // Optional, but if present must be an array of strings.
            tags: Match.Optional('Test String')
        });
        // ... do something with the message ...
    } });

/**
* From Match patterns section
*/
var pat = { name: Match.Optional('test') };
check({ name: "something" }, pat);
check({}, pat);
check({ name: undefined }, pat);

// Outside an object
check(undefined, Match.Optional('test')); // OK

/**
* From Deps, Deps.autorun section
*/
Deps.autorun(function () {
    var oldest = Monkeys.findOne('age = 20');

    if (oldest)
        Session.set("oldest", oldest.name);
});

Deps.autorun(function (c) {
    if (!Session.equals("shouldAlert", true))
        return;

    c.stop();
    alert("Oh no!");
});

/**
* From Deps, Deps.Computation
*/
if (Deps.active) {
    Deps.onInvalidate(function () {
        Monkeys.destroy();
        Rooms.finalize();
    });
}

/**
* From Deps, Deps.Dependency
*/
var weather = "sunny";
var weatherDep = new Deps.Dependency;

var getWeather = function () {
    weatherDep.depend();
    return weather;
};

var setWeather = function (w) {
    weather = w;

    // (could add logic here to only call changed()
    // if the new value is different from the old)
    weatherDep.changed();
};

/**
* From HTTP, HTTP.call section
*/
Meteor.methods({ checkTwitter: function (userId) {
        check(userId, String);
        this.unblock();
        var result = HTTP.call("GET", "http://api.twitter.com/xyz", { params: { user: userId } });
        if (result.statusCode === 200)
            return true;
        return false;
    } });

HTTP.call("POST", "http://api.twitter.com/xyz", { data: { some: "json", stuff: 1 } }, function (error, result) {
    if (result.statusCode === 200) {
        Session.set("twizzled", true);
    }
});

/**
* From Email, Email.send section
*/
Meteor.methods({
    sendEmail: function (to, from, subject, text) {
        check([to, from, subject, text], [String]);

        // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        this.unblock();

        Email.send({
            to: to,
            from: from,
            subject: subject,
            text: text
        });
    }
});

// In your client code: asynchronously send an email
Meteor.call('sendEmail', 'alice@example.com', 'Hello from Meteor!', 'This is a test of Email.send.');

UI.registerHelper('$concat', function (a, b, c, d, e) {
    return '' + a + b + c + d + e;
});

var testBody = UI.body;
UI.render(Template['adminDashboard']);
UI.renderWithData(Template['adminDashboard'], { testData: 123 });
UI.insert(Template['adminDashboard'], el.firstChild, el.firstChild.firstChild);
UI.remove(Template['adminDashboard']);
UI.getElementData(el);
