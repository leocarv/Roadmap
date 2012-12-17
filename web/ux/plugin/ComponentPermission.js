Ext.define('Ext.ux.plugin.ComponentPermission', {
    extend: 'Ext.AbstractPlugin',
    requires: ['Netvision.util.NotificationManager'],
    alias: 'plugin.ComponentPermission',

    getConfig: function(component){
        if(component instanceof Ext.window.Window){
            return {
                event: 'beforeshow',
                fn: function(w){
                    w.destroy();
                    Netvision.util.NotificationManager.warning({
                        title: gettext('Aviso'),
                        message: gettext('Você não tem permissão para acessar esta funcionalidade')
                    });
                    return false;
                }
            };
        }

        if(component instanceof Ext.panel.Panel){
            return {
                event: 'beforerender',
                fn: function(panel){
                    panel.disabled = true;

                    var fun_mock = function(){
                        return false;
                    };
                    panel.enable = fun_mock;
                }
            };
        }

        if(component instanceof Ext.grid.Panel){
            return {
                event: 'beforerender',
                fn: function(grid){
                    var ac = grid.down('actioncolumn');
                    Ext.Array.remove(grid.columns, ac);

                    grid.on('afterrender', function(grid){
                        Ext.each(grid.plugins, function(plugin){
                            var plugins = {
                                "Ext.grid.plugin.RowEditing": 1,
                                "Ext.grid.plugin.CellEditing": 1
                            };

                            if(Ext.getClass(plugin).getName() in plugins){
                                plugin.destroy();
                            }
                        });
                    });
                }
            };
        }

        if(component instanceof Ext.button.Button){
            return {
                event: 'beforerender',
                fn: function(btn){
                    btn.disabled = true;

                    var fun_mock = function(){
                        return false;
                    };
                    btn.enable = fun_mock;
                    btn.handler = Ext.emptyFn;
                    btn.clearListeners();
                }
            };
        }

        Ext.Error.raise('Componente não configurado no plugin.');
    },

    init: function(component){
        var permission = component.permission,
            config = {};

        if(!permission){
            Ext.Error.raise('Nenhuma permissão definida para o componente.');
        }

        if(Ext.isString(permission)){
            permission = {codename: permission};
        }

        Ext.apply(config, permission, this.getConfig(component));

        if(!Ext.Array.contains(Netvision.Session.logged_user.permissions, config.codename)){
            component.on(config.event, config.fn, component);
        }
    }
});
