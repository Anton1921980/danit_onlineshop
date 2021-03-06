const gulp = require("gulp");
const sass = require("gulp-sass");
const imagemin = require("gulp-imagemin");
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const cleanCSS = require("gulp-clean-css");
const concat = require('gulp-concat');
const browserSync = require("browser-sync").create();
const rename = require("gulp-rename");
const watch = require("gulp-watch");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const uglify = require("gulp-uglify-es").default;
const rigger = require("gulp-rigger");

const paths = {
    img:["./src/images/**"],
    css:["./src/scss/**/*.scss"],
    html:["./src/templates/index.html"],
    htmlFinal:["./src/templates/final/index_final.html"],
    htmlBuild:["./src/templates/final/index.html"],
    templates:["./src/templates/*.html"],
    final:["./src/templates/final/"],
    script:["./src/js/**.js"],
    dist:["./dist"],
    distCSS:["./dist/css"],
    distJS:["./dist/js"],
    distIMG:["./dist/images"],
};

gulp.task("html", function () {
    return gulp.src(paths.html)
            .pipe(rigger())
            .pipe(gulp.dest("./"))
            .pipe(browserSync.stream());
});

gulp.task("htmlFinal", function () {
    return gulp.src(paths.htmlBuild)
            .pipe(rigger())
            .pipe(gulp.dest("./"))
            .pipe(browserSync.stream());
});

gulp.task("remove", function () {
    return gulp.src(paths.templates)
            .pipe(gulp.dest(paths.final))
});

gulp.task("rename", function () {
    return gulp.src(paths.htmlFinal)
            .pipe(rename({
                basename: "index",
                extname: ".html"
            }))
            .pipe(gulp.dest("./src/templates/final/"))
});

gulp.task("styles_dev", function () {
    return gulp.src(paths.css)
            .pipe(sourcemaps.init())
            .pipe(sass().on("error", sass.logError))
            .pipe(autoprefixer({
                cascade: false
            }))
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest(paths.distCSS))
            .pipe(browserSync.stream())
});

gulp.task("styles", function () {
    return gulp.src(paths.css)
            .pipe(sourcemaps.init())
            .pipe(sass().on("error", sass.logError))
            .pipe(autoprefixer({
                cascade: false
            }))
            .pipe(cleanCSS({
                level: 2
            }))
            .pipe(sourcemaps.write("./"))
            .pipe(rename({
                suffix: ".min"
            }))
            .pipe(gulp.dest(paths.distCSS))
            .pipe(browserSync.stream())
});

gulp.task("scripts_dev", function () {
    return gulp.src(paths.script)
            .pipe(concat("main.js"))
            .pipe(gulp.dest(paths.distJS))
            .pipe(browserSync.stream())
});

gulp.task("scripts", function () {
    return gulp.src(paths.script)
            .pipe(concat("main.js"))
            .pipe(uglify()).on('error', console.error)
            .pipe(rename({
                suffix: ".min"
            }))
            .pipe(gulp.dest(paths.distJS))
            .pipe(browserSync.stream())
});

gulp.task("img-compress", function () {
    return gulp.src(paths.img)
            .pipe(imagemin({
                progressive: true
            }))
            .pipe(gulp.dest(paths.distIMG))
});

gulp.task("clean", function () {
    return del(["dist/*", "!dist/fonts", "!dist/library"])
});

gulp.task("cleanTamplates", function () {
    return del(["./src/templates/*", "!./src/templates/*.html"])
});

gulp.task("cleanHtml", function () {
    return del(["./src/templates/final/index.html"])
});


gulp.task("watch_dev", function () {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    })
    gulp.watch("./src/templates/*.html", gulp.series("html"))
    gulp.watch(paths.img, gulp.series("img-compress"))
    gulp.watch(paths.css, gulp.series('styles_dev'))
    gulp.watch(paths.script, gulp.series("scripts_dev"))
    gulp.watch("./*.html").on("change", browserSync.reload)
    gulp.watch(".dist/css/*.css").on("change", browserSync.reload)
});

gulp.task("watch", function () {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    })
    gulp.watch(paths.htmlBuild, gulp.series("htmlFinal"))
    gulp.watch(paths.img, gulp.series("img-compress"))
    gulp.watch(paths.css, gulp.series('styles'))
    gulp.watch("./*.html").on("change", browserSync.reload)
});


gulp.task("develop", gulp.series("clean", gulp.parallel("html", "styles_dev", "scripts_dev", "img-compress"), "watch_dev"));
gulp.task("build", gulp.series("clean", "cleanTamplates", "remove", "cleanHtml", "rename", "htmlFinal", gulp.parallel("styles", "scripts", "img-compress"),"watch"));

