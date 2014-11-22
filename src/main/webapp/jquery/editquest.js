
var EditQuest =  dejavu.Class.declare({
	isOpen : false,
	oTable : $(),
	
	initialize : function() {
		
		var self = this;

		
		$('#questEditor').dialog({
			autoOpen : false,
			height : 550,
			width : 950,
			modal : false,
			close : function() {
				self.isOpen = false;
			}
		});

		CKEDITOR.replace('questionQuest', {
			width : 500,
			height : 240,
			allowedContent : true,
			extraPlugins : 'addThumb,formula,symbol',
			toolbar : [
					{
						name : 'clipboard',
						items : [ 'PasteText',
								'PasteFromWord',
								'Undo', 'Redo' ]
					},
					{
						name : 'links',
						items : [ 'Link', 'Unlink',
								'Anchor' ]
					},
					{
						name : 'paragraph',
						items : [ 'NumberedList',
								'BulletedList',
								'Outdent', 'Indent',
								'Blockquote',
								'JustifyLeft',
								'JustifyCenter',
								'JustifyRight',
								'JustifyBlock' ]
					},
					{
						name : 'insert',
						items : [ 'AddThumb',
								'Formula', 'YouTube',
								'Table',
								'HorizontalRule',
								'Smiley', 'Symbol' ]
					},
					{
						name : 'basicstyles',
						items : [ 'Bold', 'Italic',
								'Underline', 'Strike',
								'Subscript',
								'Superscript',
								'RemoveFormat' ]
					},
					{
						name : 'colors',
						items : [ 'TextColor',
								'BGColor' ]
					} ]
		});
		CKEDITOR.config.disableNativeSpellChecker = false;

		this.oTable = $('#datatable').dataTable({
							"sPaginationType" : "two_button",
							"bFilter" : true,
							"iDisplayLength" : 20,
							"bLengthChange" : true,
							"oLanguage" : {
								"sSearch" : "Filtruj wiersze: ",
								"sZeroRecords" : "Brak danych do wyświetlenia",
								"sInfoEmpty" : "Brak danych do wyświetlenia",
								"sEmptyTable" : "Brak danych do wyświetlenia",
								"sInfo" : "Widzisz wiersze od _START_ do _END_  z wszystkich _TOTAL_",
								"oPaginate" : {
									"sPrevious" : "Poprzednie",
									"sNext" : "Następne",
									"sFirst" : "Początek",
									"sLast" : "Koniec",
								},
								"sInfoFiltered" : " - odfiltrowano z _MAX_ wierszy",
								"sLengthMenu" : 'Pokaż <select>'
										+ '<option value="20">20</option>'
										+ '<option value="50">50</option>'
										+ '<option value="100">100</option>'
										+ '<option value="-1">całość</option>'
										+ '</select> wierszy'
							}
						});
	},
	
	deleteQuestion : function(id) {
		this._deleteRow(id);
		this.isOpen = false;
		$('#questEditor').dialog('close');
	}, 
	
	insertQuestion : function(id) {
		//alert("insertQuestion:" + id);
		var array = this._getArrayFromForm();
		var idForm = $('#idQuest').val();
		
		if(idForm == "0" || jQuery.trim(idForm) == "") {
			var nodeTr = this._insertNewRow(array, id);
		}
		else {
			this._editRow(array, id);
		}
		this.isOpen = false;
		$('#questEditor').dialog('close');
	},
	
	prepareToSave : function() {
		this._insertDataFromCKEditorToTextarea();
		var goodStr = this._getGoodAnswerStringFromInputs();
		$("#answerQuest").val(goodStr);
		var fakeStr = this._getFakeAnswerStringFromInputs();	
		$('#wrongQuest').val(fakeStr);
		$('#saveQuest').trigger('click');
		return false;
	},
	
    addFakeAnswer : function() {
    	var fake = $('#fakeAdd').val();
    	fake = jQuery.trim(fake);
    	if(fake.length > 0) {
    		$('#fakeAnswerList').append('<li>'+ 
    				'<button class="btn btn-danger" onclick="editQuest.delFakeAnswer(this)">'+ 
    				'<span class="glyphicon glyphicon-remove-sign"></span></button>' + fake + '</li>');
    		$('#fakeAdd').val("");
    	}
    	
    },
    
    addGoodAnswer : function(){
    	var good = $('#goodAdd').val();
    	good = jQuery.trim(good);
    	if(good.length > 0) {
    		$('#goodAnswerList').append('<li>'+ 
    				'<button class="btn btn-danger" onclick="editQuest.delFakeAnswer(this)">'+ 
    				'<span class="glyphicon glyphicon-remove-sign"></span></button>' + good + '</li>');
    		$('#goodAdd').val("");
    	}
    },
    
    delFakeAnswer : function(elem) {
    	$(elem).parent('li').remove();
    },
    
    startNewQuest : function() {
    	if(this.isOpen) return;
    	this.isOpen = true;
    	this._resetFormEdit();
    	CKEDITOR.instances.questionQuest.setData();
    	$('#questEditor').dialog('open');
    },
    
    editQuestion : function(elem) {
    	if(this.isOpen) return;
    	this.isOpen = true;
    	this._resetFormEdit();
    	var $tr = $(elem).parent('td').parent('tr');
    	var id = $tr.attr('id');
    	$('#idQuest').val(id);
    	
    	$tr.children('td').each(function(index){
    		var $td = $(this);
    		switch (index) {
    		case 0:
    			CKEDITOR.instances.questionQuest.setData($td.text());
    			break;
    		case 1:
    			var array = new Array();
    			$ul = $('#goodAnswerList');
    			$td.children('span.good').each(function(){
    				array.push($(this).text());
    			});
    			for(i in array){
    				$ul.append('<li>'+ 
    	    				'<button class="btn btn-danger" onclick="editQuest.delFakeAnswer(this)">' + 
    	    				'<span class="glyphicon glyphicon-remove-sign"></span></button>' + array[i] + '</li>');
    			}
    			$('#answerQuest').val("");
    			break;
    		case 2:
    			array = new Array();
    			$ul = $('#fakeAnswerList');
    			$td.children('span.wrong').each(function(){
    				array.push($(this).text());
    			});
    			for(i in array){
    				$ul.append('<li>' + 
    				'<button class="btn btn-danger" onclick="editQuest.delFakeAnswer(this)">' + 
    				'<span class="glyphicon glyphicon-remove-sign"></span></button>' + array[i] + '</li>');
    			}
    			$("#fakeQuest").val("");
    			break;
    		case 3:	
    			$('#levelQuest option').each(function(index){
    				if(this.innerHTML == $td.text() ) document.getElementById('levelQuest').value = (index + 1).toString();
    			});
    			break;
    		case 4: 
    			document.getElementById('dificultQuest').value = $td.text();
    			break;
    		case 5:
    			document.getElementById('departmentQuest').value =$td.text();
    			break;
    		default:
    			break;
    		}
    	});
    	$('#questEditor').dialog('open');
    },
    
    _insertDataFromCKEditorToTextarea : function() {
    	$('#questionQuest').val(CKEDITOR.instances.questionQuest.getData());
    },
    
    _getFakeAnswerStringFromInputs : function() {
    	var fakeList = [];
		var fakes = $('#fakeAnswerList').children('li').each(function(){
			fakeList.push($(this).text());
		});
		
		var inInput = $('#fakeAdd').val();
		inInput = jQuery.trim(inInput);
		if(inInput.length > 0) fakeList.push(inInput);
		
		var fakeStr = fakeList.join(';');
		return fakeStr;
    },
    
    _getGoodAnswerStringFromInputs : function() {
    	var goodList = [];
		var goods = $('#goodAnswerList').children('li').each(function(){
			goodList.push($(this).text());
		});
		
		var inInput = $('#goodAdd').val();
		inInput = jQuery.trim(inInput);
		if(inInput.length > 0) goodList.push(inInput);
		
		var goodStr = goodList.join(';');
		return goodStr;
    },
    
    _getArrayFromForm : function() {
    	var array = new Array();
    	array.push($('#questionQuest').val());
    	var goodHTML = "";
    	var goods = this._getGoodAnswerStringFromInputs().split(';');
    	for(i in goods) goodHTML += '<span class="good">' + goods[i] + '</span>'; 
    	array.push(goodHTML);
    	var fakeHTML = "";
    	var fakes = this._getFakeAnswerStringFromInputs().split(';');
    	for(i in fakes) fakeHTML += '<span class="wrong">' + fakes[i] + '</span>'; 
    	array.push(fakeHTML);
    	array.push($('#levelQuest option:selected').text());
    	array.push($('#dificultQuest option:selected').val());
    	array.push($('#departmentQuest option:selected').val());
    	array.push('<button class="btn btn-success" onclick="editQuest.editQuestion(this);"><span class="glyphicon glyphicon-edit"></span></button>');
    	return array;
    },
    
    _resetFormEdit : function() {
    	$('#questEditor').children('form').get(0).reset();
    	$('#fakeAnswerList').empty();
    	$('#goodAnswerList').empty();
    },
    
    _getTrNodeContainsId : function (id) {
		var trNodes = this.oTable.fnGetNodes();
		for (i in trNodes) {	
			if (trNodes[i].id == id)
				return trNodes[i];
		}
	},
 
    _deleteRow : function(id) {
		var tr = this._getTrNodeContainsId(id);
		this.oTable.fnDeleteRow(tr);
	},
 
	_insertNewRow : function(array, id){
		var indexes = this.oTable.fnAddData(array);
		return this.oTable.fnGetNodes(indexes[0]);
	},
 
 
	_editRow : function(array, id) {  
		var tr = this._getTrNodeContainsId(id);
		if (tr) this.oTable.fnUpdate(array, tr);  
	}
    
	
});