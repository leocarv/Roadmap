# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Changing field 'Dummy.dummy_type'
        db.alter_column('rest_dummy', 'dummy_type_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['rest.DummyType'], null=True))


    def backwards(self, orm):
        
        # User chose to not deal with backwards NULL issues for 'Dummy.dummy_type'
        raise RuntimeError("Cannot reverse this migration. 'Dummy.dummy_type' and its values cannot be restored.")


    models = {
        'rest.dummy': {
            'Meta': {'object_name': 'Dummy'},
            'dummy_stuff': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['rest.DummyStuff']", 'symmetrical': 'False'}),
            'dummy_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['rest.DummyType']", 'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'rest.dummystuff': {
            'Meta': {'object_name': 'DummyStuff'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'rest.dummytype': {
            'Meta': {'object_name': 'DummyType'},
            'clearof': ('netvision.models.OneToOneField', [], {'related_name': "'clearedby'", 'unique': 'True', 'null': 'True', 'to': "orm['rest.DummyType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'rest.securitytest': {
            'Meta': {'object_name': 'SecurityTest'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['rest']
