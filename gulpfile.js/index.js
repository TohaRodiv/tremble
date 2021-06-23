/* eslint-disable @typescript-eslint/no-var-requires */
const { CONFIG } = require("./config");

const path = require("path");

const gulp = require("gulp");
const {
	src, dest, task, series, parallel, watch,
} = require ("gulp");

const typescript = require("gulp-typescript");
const gcmq 		= require("gulp-group-css-media-queries"),
	uglify  	= require("gulp-uglify"),
	cssmin     	= require("gulp-clean-css"),
	sass        = require("gulp-sass"),
	terser 		= require("gulp-terser"),
	rename 		= require("gulp-rename"),
	plumber = require("gulp-plumber"),
	browserSync = require("browser-sync").create();


task ("sass", () =>
	src (CONFIG.source.sass)
		.pipe (plumber ())
		.pipe (sass ())
		.pipe (gcmq ())
		.pipe (dest (CONFIG.build.css))
		.pipe (cssmin ())
		.pipe (rename ({ suffix: ".min" }))
		.pipe (dest (CONFIG.build.css))
		.pipe(browserSync.stream())
);

task ("ts", () =>
	src (CONFIG.source.ts)
		.pipe (plumber ())
		.pipe (typescript ())
		.pipe(dest (CONFIG.build.js))
		.pipe (terser ())
		.pipe (rename ({ suffix: ".min"}))
		.pipe(dest (CONFIG.build.js))
		.pipe(browserSync.stream())
);

task ("watch", done => {
	watch (CONFIG.source.root, parallel ("ts"));
	watch (CONFIG.source.sass, parallel ("sass"));
	watch (CONFIG.source.html, parallel ("html"));
	done ();
});

task ("html", () => 
	src (CONFIG.source.html)
		.pipe (plumber ())
		.pipe (dest (CONFIG.build.root))
		.pipe(browserSync.stream())
);

task ("server", done => {
	browserSync.init({
		server: CONFIG.build.root,
	});

	watch (CONFIG.source.html, parallel ("html"));
	watch (CONFIG.source.sass, parallel ("sass"));
	watch (CONFIG.source.root, parallel ("ts"));

	done ();
});

task ("default", parallel ("html", "sass", "ts"));