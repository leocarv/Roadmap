Ext.define('Ext.ux.grid.PistonFiltersFeature',{
    extend: 'Ext.ux.grid.FiltersFeature',
    alias: 'feature.pistonfilters',

    encode: true,
    local: false,
    menuFilterText: gettext('Filtros'),

    statics: {
        ops: {
            'eq': '__exact',
            'gt': '__gt',
            'lt': '__lt',
            'like': '__icontains',
            'in': '__in'
        }
    },

    clearFilters : function(){
        this.callParent();
        this.getGridPanel().getStore().baseParams = {};
    },
    
    attachEvents: function(){
        this.callParent(arguments);

        var grid = this.getGridPanel();
        grid.getStore().baseParams = {};

        /**
         * If grid have the beforebindstore, the attachEvents was called once (don't need to continue)
         */
        if(grid.events.beforebindstore) return ;

        grid.addEvents('beforebindstore', 'afterbindstore');

        var fn = Ext.bind(function(){
            this.fireEvent('beforebindstore');
            Ext.grid.Panel.superclass.bindStore.apply(this, arguments);
            this.fireEvent('afterbindstore');
        }, grid);
        Ext.apply(grid, {'bindStore': fn});

        grid.on('afterbindstore', this.attachEvents, this);
    },

    onBeforeLoad: function(store, options){
        var baseParams = options.baseParams;
        if(baseParams){
            store.baseParams = baseParams;
        }
        this.callParent(arguments);
        var grid_filter = Ext.JSON.decode(options.params[this.paramPrefix]) || [];
        var filters = Ext.Array.merge(grid_filter, store.baseParams.filters || []);
        var sorters = store.baseParams.sorters || [];

        options.params[this.paramPrefix] = Ext.JSON.encode(filters);
        if(!options.sorters.length) {
            options.sorters = sorters;
        }

    },

    buildQuery: function(filters){
        if(!this.encode){
            return this.callParent(arguments);
        }

        var len_filters = filters.length;
        var f = [];
        var s = this.statics();
        var params = {}
        for(var i=0; i < len_filters; i++){
            var field = filters[i].field,
                data = filters[i].data;
                if(data.type == 'string')
                {
                    data.comparison = 'like';
                }
                else if(data.type == 'boolean')
                {
                    data.comparison = 'eq';
                }
                else if(data.type == 'list')
                {
                    data.comparison = 'in';
                }
               
                if(data.type == 'date')
                {
                    data.value = Ext.Date.parse(data.value, 'm/d/Y');
                    if(data.comparison == 'eq'){
                        var d1, d2;
                        d1 = Ext.Date.add(data.value, Ext.Date.DAY, -1);
                        d2 = Ext.Date.add(data.value, Ext.Date.DAY, 1);
                        d1 = Ext.Date.format(d1,'Y-m-d 23:59:59');
                        d2 = Ext.Date.format(d2,'Y-m-d 00:00:00');
                        f.push({
                            property: field + s.ops['gt'],
                            value: d1
                        });
                        f.push({
                            property: field + s.ops['lt'],
                            value: d2
                        });
                        continue;
                    }else{
                        data.value = Ext.Date.format(data.value,'Y-m-d');
                    }
                }
                f.push({
                    property: field + s.ops[data.comparison],
                    value: data.value
                });
        }
        if (f.length > 0){
            params[this.paramPrefix] = Ext.JSON.encode(f);
        }
        return params;
    }
});
