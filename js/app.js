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

import Backbone from 'backbone'

function app () {

    var ItemModel = Backbone.Model.extend({
        defaults: {
            description: "",
            date: "",
            done: false
        },
        initialize: function(taskName) {
            this.set({task: taskName})
        }
    })
    var TodoCollection = Backbone.Collection.extend({
        model: ItemModel
    })
    var TodoView = React.createClass({

        _addItem: function(task) {
            this.state.list.add(new ItemModel(task))
            this._update()
        },
        _update: function(){
            this.setState({
                list: this.state.list,
                done: this.state.list.where({done:true}),
                incomplete: this.state.list.where({done:false}),
                showing: location.hash.substr(1)
            })            
        },
        getInitialState: function() {
            return {
                list: this.props.todoColl,
                done: this.props.todoColl.where({done:true}),
                incomplete: this.props.todoColl.where({done:false}),
                showing: this.props.showing
            }
        },
        render: function() {
            var coll = this.state.list
            if (this.state.showing === "done") coll = this.state.done
            if (this.state.showing === "incomplete") coll = this.state.incomplete

            return (
                <div className="todoView">
                    <Tabs updater={this._update} showing={this.state.showing} />
                    <ItemAdder adderFunc={this._addItem}/>
                    <TodoList updater={this._update} todoColl={coll}/>
                </div>  
                )
        }
    })
    var Tabs = React.createClass({
        _genTab: function(tabType,i) {
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
            return <Item key={i} updater={this.props.updater} itemModel={model} />
        },

        render: function() {
            return (
                <div className="todoList">
                    {this.props.todoColl.map(this._makeItem)}
                </div>
                )
        }
    })

    var Item = React.createClass({
         _handleDue: function(keyEvent) {
            if (keyEvent.keyCode === 13) {
                var inputDate = keyEvent.target.value
                     this.props.itemModel.set({date: "Due:" + inputDate})
            this.props.updater()
           
            keyEvent.target.value =""

            }
        },
           _handleDescription: function(keyEvent) {
            if (keyEvent.keyCode === 13) {
                var inputDescription = keyEvent.target.value
                     this.props.itemModel.set({description: inputDescription})
            this.props.updater()
           
            keyEvent.target.value =""

            }
        },
        _editDesc: function(){
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
               obj.marginRight = "2%"
               edateObj.display ="inline"
            }  
             var edescObj ={display: "none", width: "4%", marginRight: "1%"}
             var inputObj = {}
               if (this.props.itemModel.get('description') !== ""){
               inputObj.display = "none"
                dObj.fontStyle = "italic"
                  dObj.fontSize = "large"
                  dObj.fontWeight = "bold"
                edescObj.display ="block"
            }        

            return (
                <div className="todoItem"  date="">
              
                    <p style={pObj}>{this.props.itemModel.get('task')}</p>
                    <button style={edescObj} onClick={this._editDesc}>{"\u270e"}</button>
<p style={dObj}>{this.props.itemModel.get('description')}</p>
                    <input style={inputObj} className="description" placeholder="About:" onKeyDown={this._handleDescription} />
                    
                 <input style={inputObjDue} className="date" placeholder="Due:" onKeyDown={this._handleDue} />
                     <button className="dateEdit" style={edateObj} onClick={this._editDate}>{"\u270e"}</button>

                                <p style={obj}>{this.props.itemModel.get('date')}</p>
                            
                    <button onClick={this._toggleDone}>{buttonFiller}</button>
                </div>
                )
        }
    })

    var TodoRouter = Backbone.Router.extend({
        routes: {
            "incomplete": "showIncomplete",
            "done": "showDone",
            "*default": "home"
        },

        showDone: function(){
            console.log('showing done')
            DOM.render(<TodoView showing="done" todoColl={new TodoCollection()}/>,document.querySelector('.container'))
        },

        home: function() {
            DOM.render(<TodoView showing="list" todoColl={new TodoCollection()}/>,document.querySelector('.container'))
        },

        showIncomplete: function() {
            DOM.render(<TodoView showing="incomplete" todoColl={new TodoCollection()}/>,document.querySelector('.container'))            
        },

        initialize: function() {
            Backbone.history.start()
        }
    })
    var pr = new TodoRouter()

}

app()