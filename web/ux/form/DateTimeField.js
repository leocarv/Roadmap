Ext.define('Ext.ux.form.DateTimeField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.datetimefield',
    layout: 'hbox',
    mixins: {
        field: 'Ext.form.field.Field'
    },
    requires: 'Netvision.util.Custom',
    dateField: null,
    timeField: null,
    dateFieldConfig: null,
    timeFieldConfig: null,
    items: [
        {
            xtype: 'datefield',
            itemId: 'datefield',
            format: 'd/m/Y',
            width: 100
        },
        {
            xtype: 'timefield',
            itemId: 'timefield',
            margin: '0 0 0 5',
            format: 'H:i',
            width: 70
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
        if (!this.verifyFieldsRenderization()) return undefined;    
        this.dateField.setDisabled(disabled);
        this.timeField.setDisabled(disabled);
    },
    
    setFieldsConfig: function(){
         Ext.each(this.items.items, function(item, k, p){
            if( item.xtype=='datefield' || item.xtype=='timefield' ){
               item.readOnly = this.readOnly;
               item.allowBlank = this.allowBlank;
            }
        }, this);
        // datefield
        this.items.items[0].applyConfig(this.dateFieldConfig);
        // timefield
        this.items.items[1].applyConfig(this.timeFieldConfig);
    },
    
    setFieldsReferences: function(){
        this.dateField = this.down('datefield[itemId=datefield]');
        this.timeField = this.down('timefield[itemId=timefield]');
    },
    
    // Return a date string formated as 'Y-m-d H:i:s'
    getValue: function(){
        if (!this.isValid()) return '';
        if (this.isEmpty()) return '';
        
        var date, time, dateTime;
        
        date = this.dateField.getValue();
        time = this.timeField.getValue();
        
        if (!date || !time ) {
            Netvision.util.NotificationManager.error({
                title: gettext('Verifique campo Data / Hora'),
                message: gettext('Os campos data e hora são obrigatórios')
            });
            this.dateField.setValue('');
            this.timeField.setValue('');
            return '';
        }
        
        dateTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes(),
            time.getSeconds()
        );
        
        return Netvision.util.Custom.ISODateString(dateTime);
    }, 
    
    setValue: function(dateTimeString){
        if (this.dataTimeStrIsValid(dateTimeString)){
            var dateFormated, timeFormated,
            dateString, timeString;

            dateTimeString = dateTimeString.split(' ');
            dateString = dateTimeString[0];
            timeString = dateTimeString[1];
            
            dateFormated = Ext.Date.parse(dateString, "Y-m-d");
            timeFormated = Ext.Date.parse(timeString, 'H:i:s');
            
            this.dateField.setValue(dateFormated);
            this.timeField.setValue(timeFormated);
        } else {
            if (dateTimeString == '' || dateTimeString == null){
                // setValue('') or setValue(null) ought clean the fields
                this.reset();
            }
        }
    },
    
    reset: function(){
        if (!this.verifyFieldsRenderization()) return undefined;
        this.dateField.reset();
        this.timeField.reset();        
    },
    
    // dateTimeString should be formated as 'Y-m-d H:i:s'
    dataTimeStrIsValid: function(dateTimeString){
        return Ext.Date.parse(dateTimeString, 'Y-m-d H:i:s');
    },
    
    // Valid doesn't mean not empty
    isValid: function(){
        if (!this.verifyFieldsRenderization()) return undefined;
        return this.dateField.isValid() && this.timeField.isValid();
    },
    
    isEmpty: function(){
        if (!this.verifyFieldsRenderization()) return undefined;    
        return !(this.dateField.getValue() instanceof Date) 
            && !(this.timeField.getValue() instanceof Date);
    },
    
    // Just check if fields are already rendered
    verifyFieldsRenderization: function(){
        return this.dateField && this.timeField;
    }
    
});
