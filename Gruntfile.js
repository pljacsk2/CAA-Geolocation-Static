module.exports = function(grunt) {
	grunt.initConfig({


		clean: {
            options: {
                force: true
            },
			html: ["html/*~"],
			inline: ["inline"],
            min: ["min"],
			dist: ["dist"]
		},
        prompt: {
            target: {
                options: {
                    questions: [
                    {
                        name: 'username',
                        type: 'input',
                        message: 'DSAL deploy username'
                    },                        
                    {
                        name: 'password',
                        type: 'password',
                        message: 'DSAL deploy password'
                    }
                    ]
                }
            }
        },
        mount: {
            prod: {
                options: {
                    windows: {
                        driveLetter: "P"
                    },
                    '*nix': {
                        fileSystem: "smbfs"
                    },
                    share: {
                        host: "comm1.dc.smartaction.local",
                        folder: "/c$/inetpub/wwwroot"
                    },
                    username: "<%= username %>",
                    password: '<%= password %>',                    
                    mountPoint: "./mntdirp"
                }
            },
            test: {
                options: {
                    windows: {
                        driveLetter: "Q"
                    },
                    '*nix': {
                        fileSystem: "smbfs"
                    },
                    share: {
                        host: "comm3.dc.smartaction.local",
                        folder: "/c$/inetpub/wwwroot"
                    },
                    username: "<%= username %>",
                    password: '<%= password %>',                    
                    mountPoint: "./mntdirq"
                }
            }            
        },
		inline: {
			options: {
				cssmin: true,
				uglify: true,
			},
			dynamic_mappings: {
				files: [
					{
						expand: true,
						src: ['*.html'],
						cwd: 'html/',
						dest: 'inline/'
					}
				],
			}
		},
		htmlmin: {
			options: {
				removeComments: true,
				collapseWhitespace: true
			},
			dynamic_mappings: {
				files: [ 
                {
					expand: true,
					cwd: 'inline/',
					src: ['*.html'],
					dest: 'min/'
				}                
                ]
			}
		},
        includereplace: {
            replace: {
                options: {
                    globals: {
                        tgturl: 'https://pub1.smartaction.com:82'
                    }
                },
                files: [
                    {src: '*.html', dest: 'dist/prod/', expand: true, cwd: 'min/'}
                ]
            },
            testreplace: {
                options: {
                    globals: {
                        tgturl: 'https://pub1-test.smartaction.com:84'
                    }
                },
                files: [
                    {src: '*.html', dest: 'dist/test/', expand: true, cwd: 'min/'}
                ]
            },
            
        },
        copy: {
            prod: {
                files: [
                    {expand: true, src: 'dist/prod/*', dest: 'P:/pub1/ersloc/', flatten: true},
                    {expand: true, src: 'dist/test/*', dest: 'P:/pub1-test/ersloc/', flatten: true}
                ]
            },
            test: {
                files: [
                    {expand: true, src: 'dist/prod/*', dest: 'Q:/pub1/ersloc/', flatten: true},
                    {expand: true, src: 'dist/test/*', dest: 'Q:/pub1-test/ersloc/', flatten: true}
                    
                ]
            }
            
        },
        unmount: {
            prod: {
                options: {
                    windows: {
                        driveLetter: "P"
                    },
                    mountPoint: "./mntdirp"
                },                    
            },
            test: {
                options: {
                    windows: {
                        driveLetter: "Q"
                    },
                    mountPoint: "./mntdirq"
                },                    
            }
        }
	});
    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-mount');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-include-replace');
	grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.registerTask('default', ['clean', 'prompt:target', 'mount', 'inline', 'htmlmin', 'includereplace', 'copy', 'unmount']);
    grunt.registerTask('ptest', ['prompt:target']);
};
