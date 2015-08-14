var fs = require('fs');

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
          target: 'dist-playstore',
          keystore: '_assets/android.keystore',
          alias: 'liveviewer',
          storePassword: 'appcelerator',
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

  grunt.registerTask('version', function (what) {
    var index = ['major', 'minor', 'patch'].indexOf(what);

    var tiapp = fs.readFileSync('tiapp.xml', {
      encoding: 'utf-8'
    });

    if (index !== -1) {

      tiapp = tiapp.replace(/(<version>)([^<]+)(<\/version>)/, function (match, before, version, after) {
        version = version.split('.');

        // bump index and reset following
        for (var i = index; i <= 2; i++) {
          version[i] = (i === index) ? (parseInt(version[i], 10) + 1).toString() : '0';
        }

        version = version.join('.');

        grunt.log.writeln('Bumped version to: ' + version);

        return before + version + after;
      });

    }

    tiapp = tiapp.replace(/(android:versionCode=")([^"]+)(")/, function (match, before, versionCode, after) {
      versionCode = parseInt(versionCode, 10) + 1;

      grunt.log.writeln('Bumped android:versionCode to: ' + versionCode);

      return before + versionCode + after;
    });

    tiapp = tiapp.replace(/(<key>CFBundleVersion<\/key>\s*<string>)([^<]+)(<\/string>)/mg, function (match, before, CFBundleVersion, after) {
      CFBundleVersion = parseInt(CFBundleVersion, 10) + 1;

      grunt.log.writeln('Bumped CFBundleVersion to: ' + CFBundleVersion);

      return before + CFBundleVersion + after;
    });

    fs.writeFileSync('tiapp.xml', tiapp);
  });

  grunt.registerTask('bump', ['version:build']);
  grunt.registerTask('build', ['titanium:clean', 'titanium:ios', 'titanium:clean', 'titanium:android']);
  grunt.registerTask('upload', ['shell']);

  grunt.registerTask('apple', ['bump', 'titanium:clean', 'titanium:appstore']);
  grunt.registerTask('google', ['bump', 'titanium:clean', 'titanium:android']);

  grunt.registerTask('default', ['bump', 'build', 'upload']);
  grunt.registerTask('ios', ['bump', 'titanium:clean', 'titanium:ios', 'shell:ios']);
  grunt.registerTask('android', ['bump', 'titanium:clean', 'titanium:android', 'shell:android']);
};
