$(document).ready(function() {

    var Library = Backbone.Collection.extend({
        url : function() { return '/library'; }
    });
    var library;

    var attrs = {
        title  : "The Tempest",
        author : "Bill Shakespeare",
        length : 123
    };

    module('Backbone.CrossDomainModel', _.extend(new Environment, {

        setup : function() {
            Environment.prototype.setup.apply(this, arguments);
            library = new Library;
            library.create(attrs, {wait: false});
        },

        teardown: function() {
            Environment.prototype.teardown.apply(this, arguments);
            Backbone.emulateHTTP = false;
        }
    }));

    test("initialize", function() {
        var xdm = new Backbone.CrossDomainModel();
        ok(xdm instanceof Backbone.CrossDomainModel, 'Backbone.CrossDomainModel created');
    });

    test("urlError", 2, function() {
        var model = new Backbone.CrossDomainModel();
        raises(function() {
            model.fetch();
        });
        model.fetch({url: '/one/two'});
        equal(this.ajaxSettings.url, '/one/two');
    });

    test("#1052 - `options` is optional.", 0, function() {
        var model = new Backbone.CrossDomainModel();
        model.url = '/test';
        Backbone.sync('create', model);
    });

    test("Backbone.ajax", 1, function() {
        Backbone.ajax = function(settings){
            strictEqual(settings.url, '/test');
        };
        var model = new Backbone.CrossDomainModel();
        model.url = '/test';
        Backbone.sync('create', model);
    });

    test("Call provided error callback on error.", 1, function() {
        var model = new Backbone.CrossDomainModel;
        model.url = '/test';
        Backbone.sync('read', model, {
            error: function() { ok(true); }
        });
        this.ajaxSettings.error();
    });

    test('Use Backbone.emulateHTTP as default.', 2, function() {
        var model = new Backbone.CrossDomainModel;
        model.url = '/test';

        Backbone.emulateHTTP = true;
        model.sync('create', model);
        strictEqual(this.ajaxSettings.emulateHTTP, true);

        Backbone.emulateHTTP = false;
        model.sync('create', model);
        strictEqual(this.ajaxSettings.emulateHTTP, false);
    });

    test('Use Backbone.emulateJSON as default.', 2, function() {
        var model = new Backbone.CrossDomainModel;
        model.url = '/test';

        Backbone.emulateJSON = true;
        model.sync('create', model);
        strictEqual(this.ajaxSettings.emulateJSON, true);

        Backbone.emulateJSON = false;
        model.sync('create', model);
        strictEqual(this.ajaxSettings.emulateJSON, false);
    });

    // Perform these tests only for IE
    if (window.XDomainRequest) {
        test("Try a DELETE request.", 1, function() {
            Backbone.emulateHTTP = true;
            var model = new Backbone.CrossDomainModel;
            model.url = '/test';

            try {
                // This should fail and throw an exception.
                model.sync('delete', model);
            } catch (x) {
                strictEqual(x.message, "Backbone.CrossDomainModel cannot use PUT, PATCH, DELETE with XDomainRequest (IE)");
            }
        });

        test("Try a PATCH request.", 1, function() {
            Backbone.emulateHTTP = true;
            var model = new Backbone.CrossDomainModel;
            model.url = '/test';

            try {
                // This should fail and throw an exception.
                model.sync('patch', model);
            } catch (x) {
                strictEqual(x.message, "Backbone.CrossDomainModel cannot use PUT, PATCH, DELETE with XDomainRequest (IE)");
            }
        });

        test("Try a PUT request.", 1, function() {
            Backbone.emulateHTTP = true;
            var model = new Backbone.CrossDomainModel;
            model.url = '/test';

            try {
                // This should fail and throw an exception.
                model.sync('update', model);
            } catch (x) {
                strictEqual(x.message, "Backbone.CrossDomainModel cannot use PUT, PATCH, DELETE with XDomainRequest (IE)");
            }
        });
 
    }
    else {
        test("#1756 - Call user provided beforeSend function.", 4, function() {
        Backbone.emulateHTTP = true;
        var model = new Backbone.CrossDomainModel;
        model.url = '/test';
        var xhr = {
            setRequestHeader: function(header, value) {
                strictEqual(header, 'X-HTTP-Method-Override');
                strictEqual(value, 'DELETE');
            }
        };
        model.sync('delete', model, {
            beforeSend: function(_xhr) {
                ok(_xhr === xhr);
                return false;
            }
        });
        strictEqual(this.ajaxSettings.beforeSend(xhr), false);
    }); 
    }
});
