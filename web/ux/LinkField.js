Ext.define('Ext.ux.LinkField', {
    alias: 'widget.linkfield',
    extend: 'Ext.form.field.Base',
    submitValue: false,
    fieldSubTpl: [
        '<div id="{id}" class="{fieldCls}"><a href="#"></a></div>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    setRawValue: function(value) {
        var val = this.callParent(arguments);
        if (this.rendered) {
            this.inputEl.dom.getElementsByTagName('a')[0].textContent = val;
        }
        return val;
    },

    initEvents: function(){
        this.addEvents('click');
    },

    listeners: {
        render: function (c) {
            c.el.on('click', function(e){
                var me = this,
                    handler = me.handler;
                me.fireEvent('click', me, e);
                if (handler) {
                    handler.call(me.scope || me, me, e);
                }
            }, c);
        },
    },

    handler: function (e) {
    }

});

