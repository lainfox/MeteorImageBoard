import React from 'react'
import PropTypes from 'prop-types'
import CommentList from 'react-uikit-comment-list'
import Comment from 'react-uikit-comment'
import { Media } from 'reactstrap'


export default class ShowComment extends React.Component {

	static propTypes = {
		comment: PropTypes.object,
  }

  render(){
  	return(
			<div className='comment-container' >
		         <Comment>
		           <Media left href="#">
		             <Media object src="http://i0.wp.com/placehold.it/64x64.gif" alt="Generic placeholder image" style={{width:'40px'}}/>
		           </Media>
		           
		           		<h6 className="commentAuthor" >
			             {this.props.comment.user.name}
			           </h6>
			           <p> {this.props.comment.text} </p>
		           
		         </Comment>
		    <hr/>
		</div>
  	)
  }
}
