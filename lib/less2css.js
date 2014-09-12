var fs = require('fs'),
    path = require('path'),
    less = require('./less/index');

module.exports = less2css;

function less2css(){
    var cssFolder = path.join(process.cwd(),'css');
    var styleFile = [];

    //文件夹内的所有less文件转成同名css文件
    fs.readdir(cssFolder,function(err,files){
        files.forEach(function(file){
           if(path.extname(file) === ".less"){

               var lessContent = fs.readFileSync(path.join(cssFolder,file) , 'utf-8');
               var dest = path.join(cssFolder,path.basename(file,'.less')) + '.css';
               styleFile.push(path.basename(file,'.less')+'.css');
               less.render(lessContent,function(err,css){
                   fs.writeFileSync(dest, css, 'utf-8')
                   console.log("已生成CSS文件"+path.basename(file,'.less')+'.css')
               })
           }
        });

        //检查根目录下的文件中引用的样式，若存在同名css文件则替换
        fs.readdir(process.cwd(),function(err,files){
            files.forEach(function(file){
                if(path.extname(file) === ".html" || path.extname(file) === ".jsp"){
                    fs.readFile(path.join(process.cwd(),file), 'utf-8', function(err,data){
                        var content = data;
                        //匹配link资源
                        var reg = /<link\s+[\s\S]*?["'\s\w\/\-](?:>|$)/ig;

                        var lessLinks = data.match(reg);

                        lessLinks.forEach(function(lessLink){

                            var hrefLocation = lessLink.split(" ")[3];
                            var isLessRe = new RegExp(/(\.less">)$/ig);
                            //如果引用的是.less样式文件则进行替换
                            if(isLessRe.test(hrefLocation)){
                                var namePattern = new RegExp(/^(href="css\/)([\s\S]*?)(\.less">)$/ig);
                                var fileName = namePattern.exec(hrefLocation)[2];
                                var cssLink = lessLink.replace(".less",".css");

                                //check if it exists

                                fs.exists(path.join(cssFolder,fileName)+'.css', function(exists){
                                    if(exists){
                                        content = content.replace(lessLink,cssLink);
                                        fs.writeFile(path.join(process.cwd(),file),content,'utf-8',function(err){
                                            if(err) throw err;
                                            console.log("已更新文件"+file+"中的"+fileName+".css")
                                        })
                                    }else {
                                        console.log(("注意：不存在文件"+file+"中的"+fileName+".css").error)
                                    }
                                })
                            }
                        });


                    })
                }
            })
        })

    });












};