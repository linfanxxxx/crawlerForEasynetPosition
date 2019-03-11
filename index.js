const request = require("request")
const cheerio = require("cheerio")
const Excel = require("exceljs")
let page = []
let promises = []
let workbook = new Excel.Workbook();
let ws = workbook.addWorksheet("test");
ws.addRow(["num","职位名称","职位描述"])

for(let i=1;i<=28;i++){
    let url = `http://hr.game.163.com/recruit.html?categoryStr=&typeStr=&cityStr=&searchStr=&pageSize=20&pageNumber=${i}`
    page.push(url)
}

for(let i=0;i<page.length;i++){
    let promise = new Promise((resolve,reject)=>{
        request(page[i],(err,response,body)=>{
            let data = []
            for(let i = 0;i<20;i++){
                let $ = cheerio.load(body)
                if($(".li-one")[i+1]){
                    // 获取职位名称
                    let pn = $(".li-one")[i+1].children[1].children[1].children[0].data;
                    // 获取职位描述
                    let pd = getDesc($,i);
                    data.push([pn,pd.join("")])
                }
            }
            resolve(data);
        })
    })
    promises.push(promise)
}

function getDesc($,num){
    let childs = $(".position-detail")[num].children[7].children
    let str = []
    childs.forEach(item=>{
        if(item.type === "text"){
            str.push(item.data)
        }
    })
    return str
}

Promise.all(promises).then(res=>{
    let result = []
    res.forEach(item=>{
        item.forEach((item2,index)=>{
            result.push([item2[0],item2[1]])
        })
    })
    result.forEach((item,index)=>{
        ws.addRow([index,item[0],item[1]])
    })
    workbook.xlsx.writeFile("output.xlsx").then(res=>{
        console.log("excel已经生成！");
    })
})