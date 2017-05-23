import React from 'react';
import ReactDOM from 'react-dom'
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router'
import { ApolloClient, createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import 'tachyons'
import 'bootstrap/dist/css/bootstrap.css';


import App from '../imports/ui/components/App'
import CreatePost from '../imports/ui/components/CreatePost'
import CreateUser from '../imports/ui/components/CreateUser'
import LoginUser from '../imports/ui/components/LoginUser'

import HotList from '../imports/ui/containers/HotList'
import TrendingList from '../imports/ui/containers/TrendingList'
import FreshList from '../imports/ui/containers/FreshList'
import KittensList from '../imports/ui/containers/KittensList'




const networkInterface = createNetworkInterface({ uri: 'https://api.graph.cool/simple/v1/cj2ryvxmbt4qw0160y6qhdgdl' })

networkInterface.use([{
  applyMiddleware (req, next) {
    if (!req.options.headers) {
      req.options.headers = {}
    }
    // get the authentication token from local storage if it exists
    if (localStorage.getItem('graphcoolToken')) {
      req.options.headers.authorization = `Bearer ${localStorage.getItem('graphcoolToken')}`
    }
    next()
  },
}])

const client = new ApolloClient({networkInterface: networkInterface});


//container the listpage to open it with the query of the category you are looking at

ReactDOM.render((
  <ApolloProvider client={client}>
    <Router history={browserHistory}>
      <Route path='/' component={App} />
      <Route path='create' component={CreatePost} />
      <Route path='login' component={LoginUser} />
      <Route path='signup' component={CreateUser} />
      <Route path='kittenslist' component={KittensList} />
      <Route path='hotlist' component={HotList} />
      <Route path='trendinglist' component={FreshList} />
      <Route path='freshlist' component={TrendingList} />
    </Router>
  </ApolloProvider>
  ),
  document.getElementById('root')
)
