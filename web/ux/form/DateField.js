Ext.define('Ext.ux.form.DateField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.uxdatefield',
    layout: 'hbox',
    mixins: {
        field: 'Ext.form.field.Field'
    },
    requires: 'Netvision.util.Custom',
    dateField: null,
    dateFieldConfig: null,
    items: [
        {
            xtype: 'datefield',
            itemId: 'datefield',
            format: 'd/m/Y',
            width: 100
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

    setFieldsConfig: function(){
         Ext.each(this.items.items, function(item, k, p){
            if( item.xtype=='datefield'){
               item.readOnly = this.readOnly;
               item.allowBlank = this.allowBlank;
            }
        }, this);
        // datefield
        this.items.items[0].applyConfig(this.dateFieldConfig);
    },

    setFieldsReferences: function(){
        this.dateField = this.down('datefield[itemId=datefield]');
    },

    // Return a date string formated as 'Y-m-d H:i:s'
    getValue: function(){
        if (!this.isValid()) return '';
        if (this.isEmpty()) return '';

        var date, cDate;

        date = this.dateField.getValue();

        cDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        return Netvision.util.Custom.ISODateString(cDate, true);
    }, 

    getRawValue: function() {
        if (!this.isValid()) return '';
        if (this.isEmpty()) return '';

        var date, cDate;

        date = this.dateField.getValue();

        cDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        return Ext.Date.format(cDate, this.format);
    },

    setValue: function(dateString){
        if (this.dataStrIsValid(dateString)){
            var dateFormated;

            dateFormated = Ext.Date.parse(dateString, "Y-m-d");
            
            this.dateField.setValue(dateFormated);

        } else {
            if (dateString == '' || dateString == null){
                // setValue('') or setValue(null) ought clean the fields
                this.reset();
            }
        }
    },

    reset: function(){
        if (!this.verifyFieldsRenderization()) return undefined;
        this.dateField.reset();
    },

    // dateString should be formated as 'Y-m-d'
    dataStrIsValid: function(dateString){
        return Ext.Date.parse(dateString, 'Y-m-d');
    },

    // Valid doesn't mean not empty
    isValid: function(){
        if (!this.verifyFieldsRenderization()) return undefined;
        return this.dateField.isValid();
    },
    
    isEmpty: function(){
        if (!this.verifyFieldsRenderization()) return undefined;    
        return !(this.dateField.getValue() instanceof Date);
    },

    // Just check if fields are already rendered
    verifyFieldsRenderization: function(){
        return this.dateField;
    }

});
