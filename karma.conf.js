module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            'src/test.ts',
            'tests/hello-world.spec.ts',
            'tests/api.integration.spec.ts'
        ],
        browsers: ['Chrome'],
        singleRun: true
    });
};