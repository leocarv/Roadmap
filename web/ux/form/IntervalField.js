Ext.define('Ext.ux.form.IntervalField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.intervalfield',
    layout: 'hbox',
    mixins: {
        field: 'Ext.form.field.Field'
    },
    hourFieldConfig: null,
    minuteFieldConfig: null,
    items: [
        {
            xtype: 'numberfield',
            itemId: 'hourField',
            width: 40,
            allowDecimals: false,
            maxValue: 99,
            minValue: 0
        },
        {
            xtype: 'label',
            text: gettext('hora(s) e'),
            margins: '5 5 0 5'
        },
        {
            xtype: 'numberfield',
            itemId: 'minuteField',
            width: 40,
            allowDecimals: false,
            maxValue: 59,
            minValue: 0
        },
        {
            xtype: 'label',
            text: gettext('minuto(s)'),
            margins: '5 5 0 5'
        }
    ],

    initComponent: function(){
        this.on('beforerender', function(){
            this.setFieldsConfig();
        }, this);

        this.on('afterrender', function(){
            this.setFieldsReferences();
        }, this);

        this.callParent(arguments);
        this.initField();
    },

    setDisabled: function(disabled){
        this.hourField.setDisabled(disabled);
        this.minuteField.setDisabled(disabled);
    },

    setFieldsConfig: function(){
        Ext.each(this.items.items, function(item, k, p){
            if( item.xtype=='numberfield' ){
                item.readOnly = this.readOnly;
                item.allowBlank = this.allowBlank;
            }
        }, this);

        this.items.items[0].applyConfig(this.hourFieldConfig);
        this.items.items[2].applyConfig(this.minuteFieldConfig);
    },

    setFieldsReferences: function(){
        this.minuteField = this.down('numberfield[itemId=minuteField]');
        this.hourField = this.down('numberfield[itemId=hourField]');
    },
    getValue: function(){
        var hour = this.hourField.getValue();
        var minute = this.minuteField.getValue()
        if (hour && minute) {
            return hour + ':' + minute;
        } else {
            return '';
        }
    },
    getRawValue: function() {
        return this.getValue();
    },
    setValue: function(value){
        if (value) {
            var tmpSplit;
            tmpSplit = value.split(":");
            if (tmpSplit.length == 2) {
                this.hourField.setValue(tmpSplit[0]);
                this.minuteField.setValue(tmpSplit[1]);
            }
        }
    }
});
