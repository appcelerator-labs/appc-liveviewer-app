module.exports = function (grunt) {

  grunt.initConfig({
    settings: {
      releaseNotes: grunt.option('notes') || 'CI build',
      appName: 'LiveViewer',
      ppUuid: '964a26fe-3710-4edb-bf00-250eec45a31d',
      distributionName: 'Fokke Zandbergen (Y39937U7XN)',
      ppUuidStore: '',
      installrAppToken: '6xC0I8SdJc76kWwpqq7LhZLIyq6fBP4Z'
    },

    titanium: {
      clean: {
        options: {
          command: 'clean'
        }
      },
      ios: {
        options: {
          command: 'build',
          projectDir: './',
          platform: 'ios',
          buildOnly: true,
          target: 'dist-adhoc',
          distributionName: '<%= settings.distributionName %>',
          ppUuid: '<%= settings.ppUuid %>',
          outputDir: './dist'
        }
      },
      appstore: {
        options: {
          command: 'build',
          projectDir: './',
          platform: 'ios',
          target: 'dist-appstore',
          distributionName: '<%= settings.distributionName %>',
          ppUuid: '<%= settings.ppUuidStore %>'
        }
      },
      android: {
        options: {
          command: 'build',
          projectDir: './',
          platform: 'android',
          buildOnly: true,
          // target: 'dist-playstore',
          // keystore: '',
          // alias: '',
          // storePassword: '',
          outputDir: './dist'
        }
      }
    },

    shell: {
      ios: {
        options: {
          stdout: true
        },
        command: [
          "curl -H 'X-InstallrAppToken: <%= settings.installrAppToken %>' https://www.installrapp.com/apps.json " +
          "-F 'qqfile=@./dist/<%= settings.appName %>.ipa' " +
          "-F 'releaseNotes=<%= settings.releaseNotes %>' " +
          "-F 'notify=true'"
        ].join("&&")
      },
      android: {
        options: {
          stdout: true
        },
        command: [
          "curl -H 'X-InstallrAppToken: <%= settings.installrAppToken %>' https://www.installrapp.com/apps.json " +
          "-F 'qqfile=@./dist/<%= settings.appName %>.apk' " +
          "-F 'releaseNotes=<%= settings.releaseNotes %>' " +
          "-F 'notify=true'"
        ].join("&&")
      }
    },
  });

  grunt.loadNpmTasks('grunt-titanium');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('tiapp', function () {
    var tiapp = require('tiapp.xml').load();

    var versions = tiapp.version.split('.');
    versions[3] = parseInt(versions[3], 10) + 1;
    tiapp.version = versions.join('.');

    var androids = tiapp.doc.documentElement.getElementsByTagName('android');

    if (androids.length === 1) {
      var manifests = androids.item(0).getElementsByTagName('manifest');

      if (manifests.length === 1) {
        var manifest = manifests.item(0);

        manifest.setAttribute('android:versionName', versions.slice(0, 3).join('.'));
        manifest.setAttribute('android:versionCode', parseInt(manifest.getAttribute('android:versionCode'), 10) + 1);
      }
    }

    tiapp.write();

    grunt.log.writeln(require('util').format('Bumped version to: %s', tiapp.version));
  });

  grunt.registerTask('bump', ['tiapp']);
  grunt.registerTask('build', ['titanium:clean', 'titanium:ios', 'titanium:android']);
  grunt.registerTask('upload', ['shell']);

  grunt.registerTask('apple', ['bump', 'titanium:clean', 'titanium:appstore']);
  grunt.registerTask('google', ['bump', 'titanium:clean', 'titanium:android']);

  grunt.registerTask('nexus', ['titanium:nexus']);

  grunt.registerTask('default', ['bump', 'build', 'upload']);
  grunt.registerTask('ios', ['bump', 'titanium:clean', 'titanium:ios', 'shell:ios']);
  grunt.registerTask('android', ['bump', 'titanium:clean', 'titanium:android', 'shell:android']);
};
