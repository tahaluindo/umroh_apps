const express = require('express')
const body_parser = require('body-parser')
const path = require('path')
const file_upload = require('express-fileupload')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const con = require('./env.js')

const app = express()

app.use(express.static(path.join(__dirname+'/views/')))
app.use(cors())
app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: false }))
app.use(file_upload())
app.set('view engine','ejs')

function message(res, data, url) {
        app.set('views', __dirname+'/views')
        res.render('message', {message: data, redirect: url})
}

app.get('/trav/create/:token', (req, res) => {
    jwt.verify(req.params.token, `SECRETKEY`, (err) => {
        if (err) {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
        } else {
            const decode = jwt.verify(req.params.token, `SECRETKEY`)
            if (decode.username) {
                app.set('views', __dirname+'/views'+'/trav')
                res.render('create',{ token: req.params.token })          
            } else {
                message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
            }
        }        
    })
})

app.get('/trav/:token', (req, res) => {
    jwt.verify(req.params.token, `SECRETKEY`, function (err) {
        if (err) {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
        }
        else{
            const decode = jwt.verify(req.params.token, `SECRETKEY`)
            if (decode.username) {
                app.set('views', __dirname+'/views'+'/trav')
                con.query(`SELECT * FROM paket`, (err, results) => {
                res.render('index', {results: results, token: req.params.token,user: decode.username})
         })                            
            } else {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
            }
        }
    })
})

app.post('/trav/post/:token', (req, res) => {
     jwt.verify(req.params.token, `SECRETKEY`, (err) => {
         if (err) {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
         } else {
            const decode = jwt.verify(req.params.token, `SECRETKEY`)
             if (decode.username) {
                const saved = 'Data Berhasil Disimpan !'
                const errors = 'Data Gagal Disimpan !'
                const file = req.files
                 const img_paket = file.img_paket
                 const img_type = file.img_type
               if (!file) {
                 con.query(`INSERT INTO paket(nama,ket) VALUES(${con.escape(req.body.nama)},${con.escape(req.body.ket)})`, (err) => {
                      if (err) console.error('Gagal Insert Ke Tabel Paket !')
                  })
                 con.query(`SELECT id_paket FROM paket WHERE nama=${con.escape(req.body.nama)}`, (err, results) =>{
                      for (let i = 0; i < req.body.jenis.length; i++) {
                          con.query(`INSERT INTO jenis_paket(id_paket,jenis,fasilitas,penerbangan,harga) VALUES(${con.escape(results[0].id_paket)},${con.escape(req.body.jenis[i])},${con.escape(req.body.fasilitas[i])},${con.escape(req.body.penerbangan[i])},${con.escape(req.body.harga[i])})`, (err) => {
                             if (err) {
                                 console.error('Query Gagal !')
                             }
                          })        
                      }
                 })    
                } else {
                     img_paket.mv(__dirname+'/views/trav/upload/'+img_paket.name)
                     con.query(`INSERT INTO paket(nama,img_paket,ket) VALUES(${con.escape(req.body.nama)},${con.escape(img_paket.name)},${con.escape(req.body.ket)})`, (err) => {
                       if (err) {
                           console.error(err)
                       }
                   })
                con.query(`SELECT id_paket FROM paket WHERE nama=${con.escape(req.body.nama)}`, (err, results) =>{
             if (typeof req.body.jenis == 'string') {
                 img_type.mv(__dirname+'/views/trav/upload/pack '+img_type.name) 
                 con.query(`INSERT INTO jenis_paket(id_paket,jenis,img_type,fasilitas,penerbangan,harga) VALUES(${con.escape(results[0].id_paket)},${con.escape(req.body.jenis)},${con.escape(img_type.name)},${con.escape(req.body.fasilitas)},${con.escape(req.body.penerbangan)},${con.escape(req.body.harga)})`, (err) => {
                       if (err) {
                           message(res, errors, '/trav/'+req.params.token)
                       }
                       else{
                           message(res, saved, '/trav/'+req.params.token)
                       }
                    })
                 }else if (typeof req.body.jenis == 'object') {
                     for (let i = 0; i < req.body.jenis.length; i++) {
                         img_type[i].mv(__dirname+'/views/trav/upload/pack '+img_type[i].name) 
                         con.query(`INSERT INTO jenis_paket(id_paket,jenis,img_type,fasilitas,penerbangan,harga) VALUES(${con.escape(results[0].id_paket)},${con.escape(req.body.jenis[i])},${con.escape(img_type[i].name)},${con.escape(req.body.fasilitas[i])},${con.escape(req.body.penerbangan[i])},${con.escape(req.body.harga[i])})`, (err) => {
                               if (err) {
                                   console.error('Query Gagal !')
                               }
                            })        
                       }
                       message(res, saved, '/trav/'+req.params.token)
                 }   
                  })   
                 }
             } else {
                message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
             }
         }
     })
})

app.get('/trav/search/:token/:search', (req, res) => {
    jwt.verify(req.params.token, `SECRETKEY`, (err) => {
        if (err) {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
        } else {
            const decode = jwt.verify(req.params.token, `SECRETKEY`)
            if (decode.username) {
                con.query(`SELECT * FROM paket WHERE nama LIKE ${con.escape('%'+req.params.search+'%')} OR ket LIKE ${con.escape('%'+req.params.search+'%')} `, (err, results) => {
                    if (err) {
                        console.error('Query Gagal !')
                    } else {
                        res.status(200).send(JSON.stringify({ results }))                     
                    }
                })            
            } else {
                message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
            }         
        }
    })
})

app.get('/trav/delete/:token/:id', (req, res) => {
    jwt.verify(req.params.token, `SECRETKEY`, (err) => {
        if (err) {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
        } else {
            const decode = jwt.verify(req.params.token, `SECRETKEY`)
            if (decode.username) {
                const deleted = 'Data Berhasil Dihapus !', errors = 'Data Gagal Dihapus !', id = req.params.id
    
                function unlinkIMG(table, string, url) {
                     con.query(`SELECT ${string} FROM ${table} WHERE id_paket=${con.escape(id)}`, (err, results) => {
                     if (err) {
                         console.error('Query Gagal !')
                     } else {
                         results.forEach(element => {
                            if (string == 'img_paket') {
                                fs.unlinkSync(url+element.img_paket)                                    
                            }
                            if (string == 'img_type') {
                                fs.unlinkSync(url+element.img_type)                                    
                            }
                         });
                     }
                     })
                }
            
                function deleteRow(table) {
                    con.query(`DELETE FROM ${table} WHERE id_paket=${con.escape(id)}`,(err) => {
                        if (table == 'paket') {
                            if (err) {
                                console.log('Query Gagal !')
                            }    
                        }if (table == 'jenis_paket'){
                        if (err) {
                            message(res, errors, '/trav/'+req.params.token)
                        } else {
                            message(res, deleted, '/trav/'+req.params.token)                
                        }
                        }
                    })
                }
                unlinkIMG('paket', 'img_paket', __dirname+'/views/trav/upload/')
                unlinkIMG('jenis_paket', 'img_type', __dirname+'/views/trav/upload/pack ')
                deleteRow('paket')
                deleteRow('jenis_paket')
            } else {
                message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
            }
        }
    })
})

app.get('/trav/pack/:token/:id', (req, res) => {
    jwt.verify(req.params.token,`SECRETKEY`, (err) => {
        if (err) {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
        } else {
            const decode = jwt.verify(req.params.token, `SECRETKEY`)
            if (decode.username) {
                app.set('views', __dirname+'/views/trav/')
                con.query(`SELECT * FROM jenis_paket WHERE id_paket=${con.escape(req.params.id)}`, (err, results) => {
                    if (err) {
                        console.error('Query Gagal !')
                    } else {
                        res.render('index_pack', { result: results, token: req.params.token })
                    }
                })
            } else {
                message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
            }            
        }
    })
})

app.get('/admin/register/:token', (req, res) => {
    jwt.verify(req.params.token,`SECRETKEY`, (err) => {
        if (err) {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
        } else {
            const decode = jwt.verify(req.params.token, `SECRETKEY`)
            if (decode.username) {
                app.set('views', __dirname+'/views/admin/')
                res.render('create',{ token: req.params.token })          
            } else {
                message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
            }            
        }
    })
})

app.get('/admin/dashboard/:token', (req, res) => {
    jwt.verify(req.params.token, `SECRETKEY`, (err) => {
        if (err) {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
        } else {
            const decode = jwt.verify(req.params.token, `SECRETKEY`)
            if (decode.username) {
                app.set('views', __dirname+'/views/admin/')
                res.render('dashboard', { token: req.params.token })
            } else {
                message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
            }           
        }
    })
})

app.post('/admin/registered/', (req, res) => {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) {
            console.log('Hash Password Gagal')
        } else {
            con.query(`SELECT * FROM admin WHERE username=${con.escape(req.body.username)} OR alias=${con.escape(req.body.alias)}`, (err, result) => {
                if (err) {
                    console.error('Query Gagal !')
                } else {
                    if (result.length) {
                        message(res, 'Nama atau Username sama !', '/admin/register/')
                    }else{
                        con.query(`INSERT INTO admin(alias,username,password,telp) VALUES(${con.escape(req.body.alias)},${con.escape(req.body.username)},${con.escape(hash)},${con.escape(req.body.telp)})`, (err) => {
                            if (err) {
                                console.error('Query Gagal !')
                            } else {
                                message(res, 'Data Berhasil Disimpan !', '/admin/register/')
                            }
                        })
                    }
                }
            }) 
        }
    })
})

app.post('/admin/login/post', (req, res) => {
    let username = req.body.username, password = req.body.password
    con.query(`SELECT * FROM admin WHERE username=${con.escape(username)}`, (err, result) => {
        if (err) {
            console.error('Query Gagal !')
        } else {
            if (!result.length) {
                message(res, 'Username atau Password tidak Cocok !', '/admin/login/')
            } else {
                bcrypt.compare(password, result[0].password, (err, results) => {
                    if (err) {
                    message(res, 'Username atau Password tidak Cocok !', '/admin/login/')    
                    }
                    else if (results) {
                        const token = jwt.sign({
                            username: result[0].username,
                            id_user: result[0].id_admin
                        },'SECRETKEY',{
                            expiresIn: '1h'                            
                        })

                        con.query(`UPDATE admin SET logged=now() WHERE id_admin=${con.escape(result[0].id_admin)}`, (err) => {
                            if (err) {
                                console.error('Query Gagal !')
                            } else {
                                res.redirect(`/admin/dashboard/${token}`)
                            }
                        }) 
                    }
                })
            }
        }
    })    
})

app.get('/admin/logout/:token', (req, res) => {
    jwt.verify(req.params.token, `SECRETKEY`, (err) => {
        if (err) {
            message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
        } else {
            const decode = jwt.verify(req.params.token, `SECRETKEY`)
            if (decode.username) {
                const blacktoken = jwt.sign({
                    username: decode.username,
                    id_user: decode.id_user
                },`SECRETKEY`,{ expiresIn: '0s' })
                req.params.token = blacktoken
                message(res, 'Logout Berhasil !', '/admin/login/')
            } else {
                message(res, 'Sesi tidak ditemukan, Silahkan Login dulu . . . .','/admin/login/')
            }            
        }
    })
})

app.get('/admin/login/', (req, res) => {
    app.set('views', __dirname+'/views/admin/')
    res.render('login')
})

app.listen(8000, (err) => {
    if (err) {
        console.log('Server Gagal . . . . . .')
    }
    console.log('Server Running !')
})