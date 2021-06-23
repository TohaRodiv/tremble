/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");


const DIRS = {
	source: path.join ("src"),
	build: path.join ("build"),
};

const CONFIG = {
	source: {
		root: path.join (DIRS.source, "**", "*"),
		ts: path.join (DIRS.source, "ts", "*.ts"),
		sass: path.join (DIRS.source, "sass", "*.scss",),
		html: path.join (DIRS.source, "*.html"),
	},
	build: {
		root: path.join (DIRS.build),
		js: path.join (DIRS.build, "js"),
		css: path.join (DIRS.build, "css"),
	},
};

module.exports["CONFIG"] = CONFIG;