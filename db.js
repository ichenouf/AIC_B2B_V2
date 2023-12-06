const {dbConfig}=require('./config');
const mysql=require('mysql');


const db = mysql.createConnection(dbConfig);

db.connect((err)=>{ if(err){console.log(err); return;}  });


const db_module = {};


db_module.exec_query = async function (query, is_row){  
    console.log('query',query);
    return new Promise(function(resolve, reject) {
        db.query(query, function (err, results) {
            if (err) {    return reject(err);}
            if(is_row == 'row'){   
                resolve(results[0]); 
            }else if(is_row == "indexed"){
                var indexed_results={};
                db_module.foreach(results, function(i,v){indexed_results[v.id]=v;})
                resolve(indexed_results);
            }else{
                if(results.insertId) resolve(results.insertId);
                else resolve(results);
            }
        });
    });
}

db_module.select = async function(columns, table_name, where, is_row,limit,offset){  
    limit = (limit==undefined) ? "" : `LIMIT ${limit}`
    offset = (offset==undefined) ? "" : `OFFSET ${offset}`
    var query=`SELECT ${columns} FROM ${table_name} ${db_module.get_where_clause(where)} ORDER BY id ASC ${limit} ${offset}`;
    return await db_module.exec_query(query, is_row);
}


db_module.group = async function(columns, count, columnName,table_name, where, group ,is_row){  
    var query=`SELECT ${columns} , COUNT(${count}) AS ${columnName} FROM ${table_name} ${db_module.get_where_clause(where)} GROUP BY ${group} `;
    return await db_module.exec_query(query, is_row);
}

db_module.between = async function(is_row){  
    var query=`SELECT start, COUNT(status) AS status FROM appointment WHERE start BETWEEN "2021-11-07 0:00:00" AND "2021-11-07 23:59:00" AND status="1"`;
    return await db_module.exec_query(query, is_row);
}
db_module.between2 = async function(is_row){  
    var query=`SELECT start, COUNT(status) AS status FROM appointment WHERE start BETWEEN "2021-11-08 0:00:00" AND "2021-11-08 23:59:00" AND status="1"`;
    return await db_module.exec_query(query, is_row);
}
db_module.insert = async function(table_name, obj, is_row){  
    var query=`INSERT INTO ${table_name} ${db_module.get_insert_clause(obj)}`; 
    var last_id= await db_module.exec_query(query, is_row);
    if(is_row != "last") return last_id;
    return test = await db_module.select("*", table_name,{id:last_id}, "row");
}


db_module.update = async function(table_name, obj, where, is_row){  
    var query=`UPDATE ${table_name} SET ${db_module.get_set_clause(obj)} ${db_module.get_where_clause(where)}`; 
    return await db_module.exec_query(query, is_row);
}

db_module.prepared_update = async function(table_name, obj, where, is_row){
    var query=`UPDATE ${table_name} SET `; 
    for (field in obj){query += ` ${field} = ?, `}
    query = query.slice(0,-2) + db_module.get_where_clause(where)
    let values = Object.values(obj);
    for (let v of values){if (typeof(values[v]) == 'object'){values[v]=JSON.stringify(values[v])}}
    // values[5] = true;
    console.log(obj.content);
    

    console.log({query, values});
    return new Promise(function(resolve, reject) {
        db.query(query, values ,function (err, results) {
            if (err) {   return reject(err);}
            if(is_row == 'row'){   resolve(results[0]); }else{resolve(results);}
        });
    });
}

db_module.delete = async function(table_name, where, is_row){  
    var query=`DELETE FROM ${table_name} ${db_module.get_where_clause(where)}`; 
    return await db_module.exec_query(query, is_row);
}

// ADDED BY ABDS
db_module.search = async function(key, table, is_row){  
    var rows = await db_module.exec_query(`SELECT id, last_name, first_name, phone_number, profile_pic, rating FROM ${table} WHERE last_name LIKE '%${key}%' OR first_name LIKE '%${key}%' OR phone_number LIKE '%${key}%'`, is_row);
    return rows;

}

// ADDED BY SARA
db_module.searchById = async function(table,key, is_row){  
    var rows = await db_module.exec_query(`SELECT * FROM ${table} WHERE status=1 AND (from_id='${key}' OR to_id='${key}')`, is_row);
    return rows;
}
// ADDED BY IMAD
db_module.searchById2 = async function(table,key, is_row,status,start){  
    var rows = await db_module.exec_query(`SELECT * FROM ${table} WHERE status='${status}' AND start='${start}'  AND (from_id='${key}' OR to_id='${key}')`, is_row);
    return rows;
}


db_module.orderby = async function(columns, table_name, where, order, is_row){  

    var query=`SELECT ${columns} FROM ${table_name} ${db_module.get_where_clause(where)} ORDER BY ${order} ASC `;
    return await db_module.exec_query(query, is_row);
}

db_module.last_insert_id = async function(){  
    var row = await db_module.exec_query('SELECT LAST_INSERT_ID();', 'row');
    return row['LAST_INSERT_ID()'];
}

db_module.get_insert_clause = function(obj){
    var columns="";
    db_module.foreach(obj, function(index,value){
        index=escape(index);
        if(columns != ""){columns+=", ";}
        columns+=`${index}`;
    });

    var values="";
    db_module.foreach(obj, function(index, value){
        value=escape(value);
        if(values != ""){values+=", ";}

        if(typeof value == 'number'){
            values+=`${value}`;
        }else if (Array.isArray(value) || typeof value == 'object'){
            values+=`"${JSON.stringify(value).replace(/"/g, '\\"')}" `;
     
        }else{
            values+=`"${value}"`;
        }
    });

    return `(${columns}) VALUES (${values})`;
}

db_module.foreach= function(obj, callback){
    if(obj == undefined){return;}
    if(Array.isArray(obj)){
        obj.forEach(function(v, i) {
            callback(i, v);
        });
    }
    Object.keys(obj).forEach(function(i) {
        callback(i, obj[i]);
    });
}



db_module.get_set_clause = function(obj){
    var txt="";
    db_module.foreach(obj,function(index,value){
        if(txt != ""){txt+=", ";}
        index=escape(index);
        value=escape(value);

        if(typeof value == 'number' ){
            txt+=`${index} = ${value} `;
        }else if  (Array.isArray(value) || typeof value == 'object'){
            txt+=`${index} = "${escape(JSON.stringify(value))}" `;
     
        }else{
            txt+=`${index} = "${value}" `;
        }
    });
    return txt;
}

db_module.get_where_clause= function (where){
    if(where == undefined){where = [];}
    var txt="";
    if(Object.keys(where).length !=0 ){

        db_module.foreach(where, function(index, value){
            if(value == undefined){return true;}
            if(txt!=""){txt+=` AND `; }
            var negation="";
            if(value[0] == "!"){negation="!"; value=value.replace('!','');}

            if(typeof value == 'number'){
                txt+=`${index} ${negation}= ${value} `;
            }else{
                txt+=`${index} ${negation}= "${value}" `;
            }
        });
        txt=` WHERE ${txt} `;
    }
    return txt;
}


function escape(str){
    if(typeof str != 'string'){return str;}
    return str.replace(/"/g, '\\"');
}

module.exports = db_module;