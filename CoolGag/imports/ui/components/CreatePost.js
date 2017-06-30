import React from 'react';
import { withRouter } from 'react-router';
import { gql, graphql, compose, withApollo, fetchPolicy } from 'react-apollo';
import {Button} from 'reactstrap';
import ContentEditable from 'react-contenteditable';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';
import Popup from 'react-popup';
import FileSelectButton from './FileHandling/FileSelectButton';
import WindowDropZone from './FileHandling/WindowDropZone';
import FileHandling from './FileHandling/FileHandling';
import TagUtils from './TagUtils';
import PredefinedMemeSelect from './PredefinedMemeSelect';
import PostUtils from './Posts/PostUtils';
import {Container, Row, Col} from 'reactstrap';

class CreatePost extends React.Component {

	static propTypes = {
		router: PropTypes.object.isRequired,
		mutate: PropTypes.func.isRequired,
		data: PropTypes.object.isRequired,
		group: PropTypes.object
	}

	static placeholders = {
		upper: 'Enter',
		lower: 'Text'
	}

	state = {
		description: '',
		category: '',   //this is an enum, options need to be loaded from enum properties
		imageUrl: '',
		imageSize: {width: 0, height: 0},
		isSubmitting: false,
		isRendering: false,
		file: null,
		postedFileId: '',
		isDraggingFile: false,
		isValidType: true,
		isLoadingFile: false,
		isTextEntered: false,
		isPredefinedMeme: false,
		userId: '',
		upperImageText: CreatePost.placeholders.upper,
		lowerImageText: CreatePost.placeholders.lower
	}

	static fontSizePercentage = 0.09;
	static textStyle = {
		'text-align': 'center',
		'font-family': 'impact',
		'color': 'white',
		'position': 'absolute',
		'width': '100%'
		//'text-shadow': '-0.0625em -0.0625em 0 #000, 0.0625em -0.0625em 0 #000,-0.0625em  0.0625em 0 #000,0.0625em  0.0625em 0 #000,-0.0625em  0em 0 #000,0.0625em  0em 0 #000, 0em 0.0625em 0 #000, 0em -0.0625em 0 #000'
	};
	static upperTextStyle = {
		'top': '0'
	};
	static lowerTextStyle = {
		'bottom': '.25em' // not 0, since thas caused the text to have no gap towards the bottom at all
	};

	isSubmittable() {
		return this.state.description && (this.state.file || this.state.isPredefinedMeme && this.state.imageUrl && this.state.isTextEntered) && !this.state.isSubmitting;
	}

	onWindowResize(event) {
		this.recalcImageFontSize();
	}
	onWindowResizeHandler = null;
	componentDidMount(a,b,c,d) {
		this.onWindowResizeHandler = (event) => {return this.onWindowResize(event);};
		window.addEventListener('resize', this.onWindowResizeHandler);
	}
	componentWillUnmount() {
		window.removeEventListener('resize', this.onWindowResizeHandler);
		this.onWindowResizeHandler = null;
	}


	render () {
		if (this.props.data.loading) {
			return (<div>Loading</div>)
		}

		// redirect if no user is logged in
		if (!this.props.data.user) {
			console.warn('only logged in users can create new posts')
			this.props.router.replace('/')
		}

		return (
			<div>
				<Container>
					<Row>
						<Col sm="12" md={{ size: 10, offset: 1 }} lg={{ size: 8, offset: 2 }} xl={{ size: 7, offset: 2.5 }}>
							<form  className='' onSubmit={this.handlePost.bind(this)}>
								<input
									className='w-100 pa3 mv2'
									value={this.state.description}
									placeholder='Description'
									onChange={(e) => this.setState({description: e.target.value})}
								/>
								{/*TagUtils.splitByTagsAndRefs("@wepner: see my #hashtag #lol #yolo").map((element, index)=>{
									if (element.type == 'tag') {
										return (<a href="#" key={index}>#{element.text}</a>);
									} else if(element.type == 'ref') {
										return (<a href="#" key={index}>@{element.text}</a>);
									} else {
										return element.text;
										//return (<span key={index}>{element.text}</span>)
									}
								})*/}
								<input
									className='w-100 pa3 mv2'
									value={this.state.category}
									placeholder='Category -> Try KITTENS or WTF'
									onChange={(e) => this.setState({category: e.target.value})}
								/>
								<FileSelectButton onSelect={this.handleFileSelect.bind(this)} />
								<WindowDropZone
									onDragStart={this.onDragStart.bind(this)}
									onDragEnd={this.onDragEnd.bind(this)}
									onDrop={this.onDropFiles.bind(this)}
								/>
								&nbsp;
								<button type="button" className='pa3 bn ttu pointer bg-black-10 dim' onClick={this.onSelectMeme.bind(this)}>Select Meme</button>
								{ !this.state.imageUrl &&
									<div className='w-100 dropzone mv3'>
										{ !this.state.isLoadingFile && !this.state.isDraggingFile &&
											<span>Kein Bild ausgewählt.</span>
										}
										{ this.state.isLoadingFile &&
											<span>Processing File...</span>
										}
										{ this.state.isDraggingFile && this.state.isValidType &&
											<span>Drop to Upload</span>
										}
										{ this.state.isDraggingFile && !this.state.isValidType &&
											<span>Invalid File</span>
										}
									</div>
								}
								{ this.state.imageUrl &&
									<div className={'imagePreviewCotnainer w-100 mv3' + (this.state.isDraggingFile ? ' isDragging' : '')}>
										<div className={'imagePreview' + (this.state.isTextEntered ? ' textEntered' : '')}>
											<img src={this.state.imageUrl} crossOrigin='Anonymous' role='presentation' className='w-100' onLoad={this.onImageLoaded.bind(this)} onError={this.onImageLoadError.bind(this)} />
											<ContentEditable
												onFocus={this.onImageTextFocused.bind(this)}
												onBlur={this.onImageTextBlured.bind(this)}
												className={"outlined upper imageText uncheckedSpelling" + (this.state.isTextEntered ? '' : ' placeholder')}
												html={this.state.upperImageText}
												onChange={this.onImageTextChanged.bind(this, 'upperImageText')}></ContentEditable>
											<ContentEditable
												onFocus={this.onImageTextFocused.bind(this)}
												onBlur={this.onImageTextBlured.bind(this)}
												className={"outlined lower imageText uncheckedSpelling" + (this.state.isTextEntered ? '' : ' placeholder')}
												html={this.state.lowerImageText}
												onChange={this.onImageTextChanged.bind(this, 'lowerImageText')}></ContentEditable>
										</div>
										{ (this.state.isDraggingFile || this.state.isLoadingFile) &&
											<div className='w-100 dropzone'>
												{ this.state.isDraggingFile && this.state.isValidType &&
													<span>Drop to Upload</span>
												}
												{ this.state.isDraggingFile && !this.state.isValidType &&
													<span>Invalid File</span>
												}
												{ this.state.isLoadingFile &&
													<span>Processing File...</span>
												}
											</div>
										}
									</div>
								}
								<button type="submit" disabled={(this.isSubmittable() ? "" : "disabled")} className={'pa3 bn ttu pointer' + (this.isSubmittable() ? " bg-black-10 dim" : " black-30 bg-black-05 disabled")}>
									{this.state.isSubmitting ? (this.state.isRendering ? 'Rendering...' : 'Submitting ...') : 'Post'}
								</button>
								<Popup
									className = "memeSelectPopup"
									btnClass = "popup__btn"
									closeBtn = {true}
									closeHtml = {null}
									defaultOk = "Ok"
									defaultCancel = "Cancel"
									wildClasses = {false}
									closeOnOutsideClick = {true} />
							</form>
						</Col>
					</Row>
				</Container>
			</div>
		)
	}

	recalcImageFontSize(element) {
		if(!element) {
			$(ReactDOM.findDOMNode(this)).find('.imagePreview').each((i, e)=>{
				this.recalcImageFontSize(e);
			});
		} else {
			$(element).css({'font-size': $(element).width() * CreatePost.fontSizePercentage + "px"});
		}
	}

	async handlePost(event) {
		event.preventDefault();
		this.setState({'isSubmitting': true});

		// TODO(rw): clean up

		var continueUpload = () => {
			fetch('https://api.graph.cool/file/v1/cj2ryvxmbt4qw0160y6qhdgdl', {
				body: data,
				method: 'POST'
			}).then((response) => {
				response.json().then(result => {
					//self.setState({imageUrl: result.url});
					this.setState({postedFileId: result.id});
					this.setState({userId: this.props.data.user.id});
					var {description, category, postedFileId, userId} = this.state
					var tagsTextList = TagUtils.findTags(description).textList;
					var tags = tagsTextList.map((element) => {
						return {text: element};
					});
					if(category == "") {
						category = null;
					}
					//var tags2 = '42';
					PostUtils.requestTags({
						client: this.props.client,
						tags: tagsTextList,
						callback: (actualTags) => {
							var existingTagIds = [];
							for(var i = 0; i < actualTags.length; i++) {
								var actual = actualTags[i];
								for(var j = 0; j < tags.length; j++) {
									if(tags[j].text == actual.text) {
										tags[j].id = actual.id;
										tags.splice(j,1);
										existingTagIds.push(actual.id);
										j -= 1;
									}
								}
							}
							this.props.mutate({
								variables: {
									description: description,
									postedFileId: postedFileId,
									category: category,
									userId: userId,
									tags: tags,
									group: group
								}
							}).then((result) => {
								var promisses = [];
								for(var i = 0; i < existingTagIds.length; i++) {
									promisses.push(PostUtils.addExistingTag({
										client: this.props.client,
										postId: result.data.createPost.id,
										tagId: existingTagIds[i]
									}));
								}
								// TODO(rw): check, if the reference adding worked
								//for(var i = 0; i < promisses.length; i++) {
								//	await promisses[i];
								//}
								this.props.router.replace('/');
							});
						}
					});
				});
			}).catch((exception) => {
				// TODO: handle upload error
				console.log('error uploading the file!');
				this.setState({'isSubmitting': false});
			});
		};

		let data = new FormData();
		if(this.state.isTextEntered) {
			this.generateImage({
				callback: (dataUrl) => {
					var blob = FileHandling.dataURItoBlob(dataUrl);
					data.append('data', blob, 'generated.jpeg');
					continueUpload();
				}
			});
		} else {
			data.append('data', this.state.file);
			continueUpload();
		}

		return false;
	}

	onDragStart(validType) {
		this.setState({
			isDraggingFile: true,
			isValidType: validType
		});
	}
	onDragEnd() {
		this.setState({
			isDraggingFile: false
		});
	}
	onDropFiles(files) {
		if(files.length >= 1) {
			this.handleFileSelect(files[0]);
		}
	}

	onImageLoadError(event) {
		console.log('error');
		this.setState({'imageUrl': ''});
		this.setState({'file': null});
	}

	onImageLoaded(event) {
		var imageElement = event.nativeEvent.srcElement || event.nativeEvent.originalTarget;
		this.recalcImageFontSize();
		$('.uncheckedSpelling').attr('spellcheck', 'false');
		this.setState({
			imageSize: {width: imageElement.naturalWidth, height: imageElement.naturalHeight},
			isLoadingFile: false
		});
	}

	handleFileSelect(file) {
		if(file != null) {
			this.setState({
				file: null,
				imageUrl: '',
				isLoadingFile: true,
				isPredefinedMeme: false
			});
			FileHandling.getDataUrl(file, (result) => {
				this.setState({
					file: file,
					imageUrl: result,
					isLoadingFile: false
				});
			});
		}
	}

	onSelectMeme() {
		var onSelect = (meme) => {
			this.setState({
				'isPredefinedMeme': true,
				'isLoadingFile': true,
				'imageUrl': '/imageProxy?imageSecret=' + meme.file.secret
			});
			Popup.close(popupId);
		};
		var popupId = Popup.create({
			title: null,
			content: (<PredefinedMemeSelect onSelect={onSelect} />),
			className: 'alert',
			buttons: {
				right: ['cancel']
			}
		});
	}


	// ContentEditable: https://github.com/lovasoa/react-contenteditable
	onImageTextFocused() {
		if(!this.state.isTextEntered) {
			this.setState({
				upperImageText: '',
				lowerImageText: ''
			});
		}
	}
	onImageTextChanged(stateName, event) {
		if(event.nativeEvent && (event.nativeEvent.srcElement || event.nativeEvent.originalTarget)) {
			var element = event.nativeEvent.srcElement || event.nativeEvent.originalTarget;
			if(typeof element.innerHTML == "string") {
				var value = element.innerHTML;
				var previousValue = this.state[stateName];
				if(value != previousValue) {
					tmp = {isTextEntered: true};
					tmp[stateName] = value;
					this.setState(tmp);
				}
			}
		}
	}
	onImageTextBlured() {
		if(!this.state.upperImageText && !this.state.lowerImageText) {
			this.setState({
				isTextEntered: false,
				upperImageText: CreatePost.placeholders.upper,
				lowerImageText: CreatePost.placeholders.lower
			});
		}
	}
	styleObjectToString() {
		result = "";
		for(var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			for(var key in arg) {
				result += key + ':' + arg[key] + ';';
			}
		}
		return result;
	}

	// Image from DOM: https://developer.mozilla.org/de/docs/Web/HTML/Canvas/Drawing_DOM_objects_into_a_canvas
	generateImage(options) {
		this.setState({'isRendering': true});
		var img = new Image();

		img.onload = () => {
			var width = this.state.imageSize.width;
			var height = this.state.imageSize.height;
			var canvas = document.createElement('canvas');
			//var canvas = document.getElementById('generationTest');
			var ctx = canvas.getContext('2d');
			canvas.width = width;
			canvas.height = height;
			canvas.style = 'width: ' + 400 + 'px;';
			var fontSize = width * CreatePost.fontSizePercentage;

			var blackUpperText;
			var whiteUpperText;
			var blackLowerText;
			var whiteLowerText;

			this.drawText({
				html: this.state.upperImageText,
				fontSize: fontSize,
				width: width,
				height: height,
				color: 'black'
			}).then((result)=>{
				blackUpperText = result;
				this.drawText({
					html: this.state.upperImageText,
					fontSize: fontSize,
					width: width,
					height: height,
					color: 'white'
				}).then((result)=>{
					whiteUpperText = result;
					this.drawText({
						html: this.state.lowerImageText,
						fontSize: fontSize,
						width: width,
						height: height,
						color: 'black'
					}).then((result)=>{
						blackLowerText = result;
						this.drawText({
							html: this.state.lowerImageText,
							fontSize: fontSize,
							width: width,
							height: height,
							color: 'white'
						}).then((result)=>{
							whiteLowerText = result;

							//ctx.drawImage(blackUpperText, -5, fontSize / 5-5);
							ctx.clearRect(0, 0, canvas.width, canvas.height);
							ctx.drawImage(img, 0, 0);
							var offset = fontSize / 16;
							ctx.drawImage(blackUpperText, -offset, fontSize / 16 - offset);
							ctx.drawImage(blackUpperText, -offset, fontSize / 16);
							ctx.drawImage(blackUpperText, -offset, fontSize / 16 + offset);
							ctx.drawImage(blackUpperText, 0, fontSize / 16 - offset);
							ctx.drawImage(blackUpperText, 0, fontSize / 16 + offset);
							ctx.drawImage(blackUpperText, offset, fontSize / 16 - offset);
							ctx.drawImage(blackUpperText, offset, fontSize / 16);
							ctx.drawImage(blackUpperText, offset, fontSize / 16 + offset);
							ctx.drawImage(whiteUpperText, 0, fontSize / 16);

							ctx.drawImage(blackLowerText, -offset, height - blackLowerText.height - offset);
							ctx.drawImage(blackLowerText, -offset, height - blackLowerText.height);
							ctx.drawImage(blackLowerText, -offset, height - blackLowerText.height + offset);
							ctx.drawImage(blackLowerText, 0, height - blackLowerText.height - offset);
							ctx.drawImage(blackLowerText, 0, height - blackLowerText.height + offset);
							ctx.drawImage(blackLowerText, offset, height - blackLowerText.height - offset);
							ctx.drawImage(blackLowerText, offset, height - blackLowerText.height);
							ctx.drawImage(blackLowerText, offset, height - blackLowerText.height + offset);
							ctx.drawImage(whiteLowerText, 0, height - whiteLowerText.height);

							var dataUrl = canvas.toDataURL('image/jpeg', 0.85);

							this.setState({'isRendering': false});
							if(options && typeof options.callback == 'function') {
								options.callback(dataUrl);
							}
						});
					});
				});
			});
		}

		img.src = this.state.imageUrl;
	}

	drawText(options) {
		var color = options && options.color ? options.color : 'black';
		var html = options && options.html ? options.html : '';
		var width = options && options.width ? options.width : 400;
		var height = options && options.height ? options.height : 400;
		var fontSize = options && options.fontSize ? options.fontSize : 36;
		var callback = null;

		var frame = document.createElement('iframe');
		frame.setAttribute('style', 'position:absolute;top:0;left:0;width:0;height:0;');
		frame.setAttribute('frameBorder','0');
		frame.onload = () => {
			var divContainer = $('<div style="width:' + width +'px; height: ' + height +'px;"></div>')[0];
			var upperStyle = this.styleObjectToString(CreatePost.textStyle, {'font-size': fontSize + 'px', width: width + 'px;', color: color, position: 'relative'});
			var lowerStyle = this.styleObjectToString(CreatePost.textStyle, {'font-size': fontSize + 'px', width: width + 'px;', color: color, position: 'relative'});
			var div = $('<div style="' + upperStyle + '">' + html + '</div>')[0];
			divContainer.appendChild(div);
			frame.contentDocument.body.appendChild(divContainer);
			html2canvas(div, {
				width: width,
				onrendered: (canvas) => {
					frame.contentDocument.body.removeChild(divContainer);
					document.body.removeChild(frame);
					if(callback) {
						callback(canvas);
					}
				}
			});
		};

		document.body.appendChild(frame);

		return {
			then: (c)=> {
				callback = c;
			}
		};
	}
}

const createPost = gql`
	mutation ($description: String!, $group: ID!, $category: POST_CATEGORY, $postedFileId: ID!, $userId: ID!, $tags: [PosttagsTag!]) {
		createPost(
			description: $description,
			postedFileId: $postedFileId,
			category: $category,
			userId: $userId,
			tags: $tags,
			group: $group)
		{
			id
			postedFile { id }
		}
	}
`

const userQuery = gql`
	query {
		user {
			id
		}
	}
`

export default compose(
  graphql(createPost),
  graphql(userQuery, fetchPolicy: "network-only" )
)(withApollo(withRouter(CreatePost)))
