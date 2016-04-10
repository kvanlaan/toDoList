// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having instlist issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

// Check for ServiceWorker support before trying to instlist it
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./serviceworker.js').then(() => {
//         // Registration was successful
//         console.info('registration success')
//     }).catch(() => {
//         console.error('registration failed')
//             // Registration failed
//     })
// } else {
//     // No ServiceWorker Support
// }

import DOM from 'react-dom'
import React, {Component} from 'react'

import Backbone from 'bbfire'
import _ from 'underscore'
import Firebase from 'firebase'

function app () {
    
var SplashPage = React.createClass({

    email: '',
    password: '',

    _handleEmailTyping: function(e) {
        this.email = e.target.value
    },

    _handlePasswordTyping: function(e) {
        this.password = e.target.value
        console.log(this.password)
    },

    _handleLogIn: function() {
        this.props.loggerInner(this.email,this.password)
    },

    _handleSignUp: function() {
        this.props.signerUpper(this.email,this.password)
    },

    render: function() {
        console.log(this)
        var errorMsg = ''
        if (this.props.error !== null) 
        errorMsg = "*Please try again. Your email address may already be in use."
        return (
            <div className="splash">
                <Header />
                <div className="loginContainer">
                    <p  className="error">{errorMsg}</p>
                    <input placeholder="e-mail"className="splashUser" onChange={this._handleEmailTyping} />
                    <input placeholder="password"className="splashPass" type="password" onChange={this._handlePasswordTyping} />
                    <button className="buttonUser"onClick={this._handleLogIn} >log in</button>
                    <button className="buttonPass" onClick={this._handleSignUp} >sign up</button>
                </div>
            </div>
        )
    }
})

var Header = React.createClass ({

      render:function(){
        var smiley = "  \u270D "
          return (
            <div className='header'>
              <h1>To-Do List{smiley}</h1>
              <p className="tagLine">Let's make a big To-Do</p>
            </div>    
          )
      }
    })
     

    var ItemModel = Backbone.Model.extend({
        defaults: {
            description: "",
            date: "",
            done: false,
            display: "inline",
            placeholderDesc: "About:",
            delete:false

        }
    })


    var TodoCollection = Backbone.Firebase.Collection.extend({
      model: ItemModel,
      url: "https://katrinatodolist.firebaseio.com/users",
      initialize: function(uid) {
        this.url = `https://katrinatodolist.firebaseio.com/users/${uid}/tasks`
      }
    })

    
    var ToDoView = React.createClass({

          _addItem: function(taskName) {
                var mod = new ItemModel({text:taskName})
            this.state.todoColl.add(mod.attributes)
            this._updater()
        },
      
         _delete: function(){
           this.state.todoColl = this.state.todoColl.where({delete:false})
            this._updater()
        },

        _updater: function(){
             this.setState({
                todoColl: this.state.todoColl,
                done: this.state.todoColl.where({done:true}),
                incomplete: this.state.todoColl.where({done:false}),
                showing: location.hash.substr(1)
            })           
        },

        componentWillMount: function() {
            var self = this
            this.props.todoColl.on('sync',function(){self.forceUpdate()})
        },
        
         getInitialState: function() {
            return {
                todoColl: this.props.todoColl,
                done: this.props.todoColl.where({done:true}),
                incomplete: this.props.todoColl.where({done:false}),
                showing: this.props.showing
            }
        },

        render: function() {
            var coll = this.state.todoColl
            if (this.state.showing === "done") coll = this.state.todoColl.where({done:true})
            if (this.state.showing === "incomplete") coll = this.state.todoColl.where({done:false})

            return (
                <div className="todoView">
                  <div className="log">
                    <a href="#logout">log out</a>
                    </div>
                    <Tabs updater={this._updater} showing={this.state.showing} />
                    <ItemAdder adderFunc={this._addItem}/>
                    <TodoList updater={this._updater} delete={this._delete} todoColl={coll}/>
                </div>  
                )
        }
    })
    var Tabs = React.createClass({

        
        _genTab: function(tabType, i) {
            return <Tab updater={this.props.updater} key={i} type={tabType} showing={this.props.showing} />
        },
        render: function() {
            return (
                <div className="tabs">
                    {["list","done","incomplete"].map(this._genTab)}
                </div>
                )
        }
    })
    var Tab = React.createClass({
         _changeRoute: function() {
            location.hash = this.props.type
            this.props.updater()
        },
        
       
        render: function() {
            var styleObj = {}
            var smiley = ""
            if (this.props.type === this.props.showing){
                styleObj.background ="grey"               

            
            if(this.props.type === "incomplete") {
                smiley = " \u2710 "
            }
       
            if(this.props.type === "done") {
                smiley = " \u270E " 
            }  

             if(this.props.type === "list") {
            smiley = "  \u270D "

        }
    }
            return (
                <div onClick={this._changeRoute} style={styleObj} className="tab">
                    <p>{this.props.type}</p>
                    <p className="smiley">{smiley}</p>
                </div>
                )
        }
    })
    var ItemAdder = React.createClass({

        _handleKeyDown: function(keyEvent) {
            if (keyEvent.keyCode === 13) {
                var guestName = keyEvent.target.value
                this.props.adderFunc(guestName)
                keyEvent.target.value = ''
            }
        },

        render: function() {
            return <input placeholder="What do you need to do?" onKeyDown={this._handleKeyDown} />
        }
    })

    var TodoList = React.createClass({

        _makeItem: function(model,i) {
            console.log(model, i)
            return <Item delete={this.props.delete} key={i} updater={this.props.updater} itemModel={model} />
        },

        render: function() {
            return (
                <div delete ={this.props.delete} todoColl={this.props.todoColl} className="todoList">
                    {this.props.todoColl.map(this._makeItem)}
                </div>
                )
        }
    })

    var Item = React.createClass({
         _handleDue: function(keyEvent) {
            if (keyEvent.keyCode === 13) {
                var inputDate = keyEvent.target.value
                     this.props.itemModel.set({date: "Due: " + inputDate})
            this.props.updater()
           
            // keyEvent.target.value =""

            }
        },
           _handleDescription: function(keyEvent) {
            if (keyEvent.keyCode === 13) {
                var inputDescription = keyEvent.target.value
                     this.props.itemModel.set({description: inputDescription})
            this.props.updater()
           
            // keyEvent.target.value =""

            }
        },
        _deleteItem: function(){
                this.props.itemModel.set({display: "none"})
               this.props.itemModel.set({delete:true})
               this.props.delete
              this.props.updater()
        },
        _editDesc: function(){
             this.props.itemModel.set({placeholderDesc: this.props.itemModel.get('description')})
            this.props.itemModel.set({description: ""})

                      this.props.updater()

            },

          _editDate: function(){
               this.props.itemModel.set({date: ""})
                      this.props.updater()
            },


        _toggleDone: function() {
            if (this.props.itemModel.get('done')) {
                this.props.itemModel.set({done: false})
            }
            else {
                this.props.itemModel.set({done: true})
            }
            this.props.updater()
        },

        render: function() {

            var buttonX = {bottom: "0", display: "block", marginBottom: "0"}
            var buttonCheck = {width: "100%", display: "block", marginBottom: "100%"}
            var itemObj ={}
               if (this.props.itemModel.get('display') === "none"){
                itemObj.display ="none"
            }
            var buttonFiller = this.props.itemModel.get('done') ? "\u2713" : ' '    
               var obj ={}
                var pObj = {}
             var dObj = {top: "10%", maxWidth: "22%", marginTop: "0"}
             var tObj = {}
       
            if (this.props.itemModel.get('done')){
         
               pObj.textDecoration = "line-through"
               pObj.fontStyle = "italic"
                obj.textDecoration = "line-through"

                obj.fontStyle = "italic"
                dObj.textDecoration = "line-through"
            }       
             var edateObj ={display: "none", width: "4s%", marginRight: "1%"}
             var inputObjDue = {}
               if (this.props.itemModel.get('date') !== ""){
               inputObjDue.display = "none"
               obj.fontSize = "xx-large"
               obj.marginRight = "2%"
               edateObj.display ="inline"
            }  
             var edescObj ={display: "none", width: "4%", marginRight: "1%"}
             var inputObj = {display:"inline"}
               if (this.props.itemModel.get("description") !== ""){
               inputObj.display = "none"
                dObj.fontStyle = "italic"
                  dObj.fontSize = "large"
                  dObj.fontWeight = "bold"
                edescObj.display ="block"
            }        

            return (
                <div style={itemObj} className="todoItem"  date="">
              
                    <p style={pObj}>{this.props.itemModel.get('text')}</p>
                    <button style={edescObj} onClick={this._editDesc}>{"\u270e"}</button>
                    <p style={dObj}>{this.props.itemModel.get('description')}</p>
                    <input style={inputObj} placeholder={this.props.itemModel.get('placeholderDesc')} onKeyDown={this._handleDescription} />
                    
                    <input style={inputObjDue} placeholder="Due:" onKeyDown={this._handleDue} />
                     <button className="dateEdit" style={edateObj} onClick={this._editDate}>{"\u270e"}</button>

                                <p style={obj}>{this.props.itemModel.get('date')}</p>
                           <div> 
                    <button style={buttonCheck} onClick={this._toggleDone}>{buttonFiller}</button>
                     <button style={buttonX} onClick={this._deleteItem}>{"\u2715"}</button>
                     </div>

                    </div>
                )
        }
    })

    var TodoRouter = Backbone.Router.extend({
            routes: {
                "done": "doneView",
                "incomplete": "incompleteView",
                "dash": "showDashboard",
                "logout": "handleLogOut",
                "splash": "showSplashPage"
            },

             initialize: function() {
        this.ref = new Firebase("https://katrinatodolist.firebaseio.com")
        var auth = this.ref.getAuth()
        console.log(auth)
        if (!auth) location.hash = "splash"

        this.on("all",function() {
          if (!this.ref.getAuth()) location.hash = "splash"
        }, this)
      },

      handleLogOut: function() {
        this.ref.unauth()
        location.hash = "splash"
      },

      showDashboard: function() {
         var tc = new TodoCollection(this.ref.getAuth().uid)

        tc.fetch({
        })
          
        DOM.render(<ToDoView showing="list" email={this.ref.getAuth().password.email} todoColl={tc} />, document.querySelector('.container'))
      },

      showSplashPage: function() {
        this.ref.unauth()
        var boundSignerUpper = this._signUserUp.bind(this)
        var boundLoggerInner = this._logUserIn.bind(this)

        DOM.render(<SplashPage loggerInner={boundLoggerInner} error={null} signerUpper={boundSignerUpper} />, document.querySelector('.container'))
      },

      _logUserIn: function(submittedEmail,submittedPassword) {
        var ref = this.ref
        var handler = function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            console.log("Authenticated successfully with payload:");
            console.log(authData)
            location.hash = "dash"
          }
        }

        ref.authWithPassword({
          email    : submittedEmail,
          password : submittedPassword
        }, handler);
      },

      _signUserUp: function(submittedEmail,submittedPassword) {
          var ref = this.ref
          var boundSignerUpper = this._signUserUp.bind(this)
          var boundLoggerInner = this._logUserIn.bind(this)
          var storeUser = function(userData) {
            ref.child('users').child(userData.uid).set({email:submittedEmail})
          }

          var handler = function(error, userData) {
            if (error) {
              console.log("Error creating user:", error);
              DOM.render(<SplashPage error={error} signerUpper={boundSignerUpper} loggerInner={boundLoggerInner} />, document.querySelector('.container'))
            } else {
              console.log("Successfully created user account with uid:", userData.uid);
              storeUser(userData)
              boundLoggerInner(submittedEmail,submittedPassword)
            }
          }

          ref.createUser({
            email    : submittedEmail,
            password : submittedPassword
          }, handler);          
      },

            incompleteView: function() {
                var tc = new TodoCollection()
                DOM.render( <ToDoView showing="incomplete" todoColl ={tc}/>,document.querySelector('.container'))
                    },
            doneView: function() {
                var tc = new TodoCollection()
                DOM.render( <ToDoView showing="done" todoColl ={tc}/>,document.querySelector('.container'))
                    },

            }) 

    var pr = new TodoRouter()

    Backbone.history.start()

    }

app()