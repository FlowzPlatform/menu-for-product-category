<template>

  <div class="dd categories-list" id="domenu-0">
  <h2 class="text-center">Available Category</h2><br/>
  <button type="button" style="margin-right: 4px" @click="save_category()" class="btn btn-primary">Save</button>
  <button type="button" style="margin-right: 4px;width: 15%;" @click="get_es()" class="btn btn-primary">Get EsDetails</button><br/><br/>
  <button class="dd-new-item" @click="closePopover()">+</button>
  <li class="dd-item-blueprint">
    <button class="collapse" data-action="collapse" type="button" style="display: none;">–</button>
    <button class="expand" data-action="expand" type="button" style="display: none;">+</button>
    <div class="dd-handle dd3-handle">Drag</div>
    <div class="dd3-content">
    <span class="item-name">[item_name]</span>

      <div class="dd-button-container">
      <button class="item-add" style="display: none;">+</button>
      <button class="item-remove" data-confirm-class="item-remove-confirm">&times;</button>
      <button class="custom-button-example">✎</button>
      </div>



      <div class="dd-edit-box" style="display: none;">
        <div class="col-sm-12 text-left">
            <div class="col-sm-4">
              <label name="Item_name"> Item Name:</label>
              <input type="text" name="title" id="name" autocomplete="off" placeholder="Item"
                     data-placeholder="Any nice idea for the title?">
                     <br>
                 <label name="target"> Target: </label>
                 <select v-model="target" name="target">
                 <option disabled selected>Please select one</option>
                 <option>_blank</option>
                 <option>_self</option>
                 <option>_parent</option>
                 <option>_top</option>
               </select><br/><br/>
            </div>
            <div class="col-sm-8">
              <div class="col-xs-12">

              <label name="href"> href: </label>
              <input type="text" name="href" placeholder="Please input href" v-model="href" id="href">
              <p class="" id="hrefError"></p>
            </div>

              <div class="col-xs-12">
                <label name="slug"> Slug: </label>
                <input type="text" name="slug" placeholder="Please input Slug" v-model="slug" id="slug" >
              </div>
            </div>
        </div>



      <br/><br/>
      <i class="end-edit">save</i>
      </div>

      </div>

  </li>

  <ol class="dd-list"></ol>

<div class="preload"><img src="http://i.imgur.com/KUJoe.gif"></div>
</div>
</template>

<script src="domenu/jquery.domenu-0.99.77.min.js"></script>
<script src="domenu/jquery.domenu-0.99.77.js"></script>
<script src="../assets/test.js"></script>
<script>
  import Vue from 'vue';
  import axios from "axios"
  import domenu from "domenu"
  import iView from 'iview'
  import _ from 'lodash'
  Vue.use(iView);
  let id = ''
  let current_category = ''
  let id1 = ''
  let id2 = ''
  let catObj = ''
  let slugArr = []
  let slugAndHref = []
  let count = 0
  let slugId = ''
  let oldName = ''
  let oldSlug = ''
  let slug = ''
  let item = ''
  let authorization_token = "xxxxxx"

  export default {
    components:{
       iView
    },
    data: () => ({
	        data: [],
          item: '',
          href: '',
          target: '',
          slug: '',
          data1:[]
	    }),
      methods: {
        get_es(){
          var $domenu = $('#domenu-0');
          var  domenu  = $('#domenu-0').domenu();
          let categoryObj = '';
         const notice = this.$Notice
         notice.config({
           duration: 10
         })
          axios({
                method:'get',
                url:"http://localhost:8181/categories/",
                headers: {'Authorization': authorization_token},
              }).then(response => {

                // console.log("**************",response.data.aggregations.group_by_category.buckets)
                let buckets = response.data.aggregations.group_by_category.buckets
                for(let i=0 ;i<buckets.length;i++){
                  let customSlug = this.slugify(buckets[i].key)
                  this.data1.push({"title":buckets[i].key,"href":"","slug":customSlug,"target":"","select2ScrollPosition":{"x":0,"y":0}})
                  // [{"title":"Hi, drag me!","customSelect":"select something...","select2ScrollPosition":{"x":0,"y":0}},{"title":"No! Wait, drag me instead!","customSelect":"http://test.com","select2ScrollPosition":{"x":0,"y":0}}]
                }
                $(".preload").hide()

                categoryObj = JSON.stringify(this.data1)
                // console.log("^^^^^^^^^^^^",categoryObj)
                catObj = categoryObj


                this.createNewObject(categoryObj,$domenu)


               console.log($('#domenu-0').domenu().toJson())
               let data = JSON.parse($('#domenu-0').domenu().toJson())

                let slugList = this.getEachSlug(data)
                 let slugHrefList = this.getEachSlugAndHref(data)


                 this.postAllSlugs(slugHrefList)

              })
              .catch(function (error) {
                // console.log("**********",error)
                    notice.error({
                        "title": "Something went wrong"
                      })


              });

        },

          createNewObject(data,divMenuObj){
            let self = this
            let domenuObj = divMenuObj.domenu({
              slideAnimationDuration: 0,
              select:                {
                support: true,
                params:  {
                  tags: true
                }
              },
              data : data
            })

            .onCreateItem(function(blueprint) {
        // We look with jQuery for our custom button we denoted with class "custom-button-example"
        // Note 1: blueprint holds a reference of the element which is about to be added the list
              var customButton = $(blueprint).find('.custom-button-example');
              customButton.click(function() {
                blueprint.find('.dd3-content span').first().click();

              });

      })

            domenuObj.parseJson()


            $(".dd-list").find("#href").bind('keyup',self.setValidation())
            self.setSlug()
            $(".dd-list").find(".end-edit").bind('click',self.getHref())



             divMenuObj.domenu().onItemAdded(function(){

               $(".dd-list").find("#href").bind('keyup',self.setValidation())
               self.setSlug()
              $(".dd-list").find(".end-edit").bind('click',self.getHref())
             })




             divMenuObj.domenu().onItemEndEdit(function() {
                // console.log("slugAndHref array..............",slugAndHref)
                self.postAllSlugs(slugAndHref)
                self.create_category()
            });
          },
          setSlug(){
            let me = this

            $(".dd-list").find("#name").focusin(function(){
                oldName = $(this).val()
                oldSlug = $(this).parent().parent().parent().find("#slug").val()
                // console.log("____________",oldSlug)

            });


            $(".dd-list").find("#name").change(function(){
                   console.log("name",$(this).val())
                  let parentObj = $(this).parent().parent().parent()

                    item = $(this).val()


                    if(oldName != item){
                      for(var i=0;i<slugArr.length;i++){
                        if(oldSlug == slugArr[i]){
                          let index = i
                          slugArr.splice(index,1)
                        }
                      }
                    }

                    slug = me.slugify(item)
                    for(var i=0;i<slugArr.length;i++){
                      if(slug == slugArr[i]){
                          let newSlug = me.generateNewSlug(slug,item)
                          console.log("_____",newSlug)
                        slug = newSlug
                      }
                    }


                    slugArr.push(slug)
                    // console.log("&&&&&&&&&&&",slugArr)
                    parentObj.find("#slug").val(slug)
                    $(".dd-list").find("#name").bind(parentObj.find("#slug").val(slug))
                      $(".dd-list").find("#name").unbind('change')
                    return slug

            });

          },
          setValidation(){
            let me = this
            $(".dd-list").find("#href").keyup(function(){
                  console.log("HREF",$(this).val())
                  let parent = $(this).parent()
                  me.validateHref($(this).val(),parent)
            });

          },
          getHref(){
            let me = this
            let href = ''
            let slug1 = ''
            $(".dd-list").find(".end-edit").click(function(){
              href = $(this).parent().find('#href').val()
              slug1 = $(this).parent().find('#slug').val()
              console.log("&&&&&&&& href and slug1",href,slug1)
              if(oldName != item){
                for(var i=0;i<slugAndHref.length;i++){
                  if(oldSlug == slugAndHref[i].slug){
                    let index = i
                    slugAndHref.splice(index,1)
                  }
                }
              }
              slugAndHref.push({slug:slug,href:href})

                // $(".dd-list").find(".end-edit").unbind('click')
              // console.log("**************",slugAndHref)
            });
          },
            slugify(string) {
              return string
                .toString()
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w\-]+/g, "")
                .replace(/\-\-+/g, "-")
                .replace(/^-+/, "")
                .replace(/-+$/, "");
      },
        validateHref(href,parent){
          // console.log("calling validate...........",parent)
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if(!regex .test(href)) {
              parent.find("#hrefError").html("Please enter a valid URL")
              return false;
            } else {
              parent.find("#hrefError").html("")
              return true;
            }
        },
        generateNewSlug(slugValue,title){
          console.log("!!!!!!!",slugValue,title)

          slugValue = this.slugify(title + '-' + count++)

          for(var i=0 ; i<slugArr.length ; i++){
              if(slugArr[i] == slugValue){
                slugValue = this.generateNewSlug(slugValue,title)
              }
         }
          return slugValue
        },
        getEachSlugAndHref(arr){
          for(let i = 0; i < arr.length; i++) {
              slugAndHref.push({slug:arr[i].slug,href:arr[i].href})
              if(arr[i].children != undefined) {
                let slugAndHref = this.getEachSlugAndHref(arr[i].children)
              }
            }
          return slugAndHref
        },
        getEachSlug(arr){
          for(let i = 0; i < arr.length; i++) {
              slugArr.push(arr[i].slug)
              if(arr[i].children != undefined) {
                let slugArr = this.getEachSlug(arr[i].children)
              }
            }
          return slugArr
        },
        save_category(){
         const notice = this.$Notice
         notice.config({
           duration: 10
         })

          let results = JSON.parse($('#domenu-0').domenu().toJson())
          let resultObj = Object.assign({"category_list": results,"id": id});
          // console.log("Save..........category",resultObj)
          axios({
                method:'post',
                url:"http://localhost:8181/categories/*/sites/",
                headers: {'Authorization': authorization_token,"content-type": "application/json"},
                data : resultObj
              }).then(response => {
                // console.log("************",response);
                catObj = JSON.stringify(results)
                id = response.data._id
                // console.log("+++++++++++",id)

        })
        .catch(function (error) {
          console.log("**********",error)
          $(".preload").hide()
            notice.error({
              "title": "Category not saved..."
            })
        });
      },
      create_category(){
        let selff = this;
        let parsedCatObj
       const notice = this.$Notice
       notice.config({
         duration: 10
       })


      let results = JSON.parse($('#domenu-0').domenu().toJson())
      // console.log(results,"+++++++++++++++")
      let resultObj = Object.assign({"category_list": results,"id":id});
      console.log(resultObj)
      axios({
            method:'post',
            url:"http://localhost:8181/categories/*/createCategory",
            headers: {'Authorization': authorization_token,"content-type": "application/json"},
            data : resultObj
          }).then(response => {
            // console.log("************",response);
            catObj = JSON.stringify(results)
            id = response.data._id
            // console.log("&&&&&&&&&&&&",id)

            $(".dd-list").find("#href").bind('keyup',selff.setValidation())
    })
    .catch(function (error) {
      // console.log("********** Category not created...Please try again",error)
      // $(".preload").hide()
        notice.error({
          "title":'Category not created...Please try again'
        })
    });
  },
      closePopover(){
        $(document).ready(function() {

            $('.dd-new-item').on('click', function (e) {
                $('[data-toggle="popover"]').popover('hide');
            });

     })
   },
   async postAllSlugs(slugAndHref){
    //  console.log("called.......................")
     axios({
           method:'get',
           url:"http://localhost:8181/categories/*/sites/slugs/*",
           headers: {'Authorization': authorization_token}
         }).then(await(response => {
              // console.log("^^^^^^^^^^^^^^^",response)
              if(response.data.hits.hits.length > 0){
              slugId = response.data.hits.hits[0]._id
              console.log("&&&&&&& slugId",slugId)
            }

              let slugHrefObj = Object.assign({slugAndHref,"id":slugId});
              console.log("!!!!!!!!!!",slugHrefObj)
              axios({
                    method:'post',
                    url:"http://localhost:8181/categories/*/sites/slugs/*",
                    headers: {'Authorization': authorization_token},
                    data: slugHrefObj
                  }).then(response => {
                      //  console.log("^^^^^^^^^^^^^^^",response)
                       slugId = response.data._id

                  })
                  .catch(function (error){
                    console.log(error)
                  });
         }))
         .catch(function (error){
           console.log(error)
         });
   }
    },
    mounted() {
       let self = this;
       var $domenu = $('#domenu-0');
 		   var  domenu  = $('#domenu-0').domenu();
       let categoryObj = '';
      const notice = this.$Notice
      notice.config({
        duration: 10
      })


       $(".preload").show()


      axios({
            method:'get',
            url:"http://localhost:8181/categories/*/sites/",
            headers: {'Authorization': authorization_token},
          }).then(response => {

            // console.log("**************",response)
            $(".preload").hide()

            if(response.data.hits.hits.length > 0){
            id = response.data.hits.hits[0]._id
            categoryObj = JSON.stringify(response.data.hits.hits[0]._source.category_list)
            // console.log("^^^^^^^^^^^^",categoryObj)
            catObj = categoryObj


            self.createNewObject(categoryObj,$domenu)


           console.log($('#domenu-0').domenu().toJson())
           let data = JSON.parse($('#domenu-0').domenu().toJson())

            let slugList = self.getEachSlug(data)


             let slugHrefList = self.getEachSlugAndHref(data)


             self.postAllSlugs(slugHrefList)

         }
          else{
            if(response.data.hits.hits.length == 0){
              notice.info({
                  "title": "No data available"
                })
                  $(".preload").hide()

                let catObj = JSON.parse($('#domenu-0').domenu().toJson())
                categoryObj = JSON.stringify(catObj)

                self.createNewObject(categoryObj,$domenu)

            }

          }


          })
          .catch(function (error) {
            console.log("**********",error)
                notice.error({
                    "title": "Something went wrong"
                  })


          });


}
}
</script>

<style>
	/**
	 * @license Copyright © 2016 Mateusz Zawartka
	 * @version 0.99.77
	 */
    /*.href {
      margin-right: 100px;
    }*/

      .dd-edit-box input,  .dd-edit-box select,  .dd-edit-box textarea {
          font-size: medium;
      }

      /*.dd-edit-box {
      position: relative;
      margin-top: 2%;
      margin-bottom: -2%;
      }*/
.dd-edit-box {display: inline-block;}
    .preload { width:100px;
      height: 100px;
      position: fixed;
      top: 50%;
      left: 50%;}

      #hrefError {
        color: red;
        font-family: sans-serif;
        font-size: small;
        display: inline-block;
    }
    /*.dd-edit-box select {
      width: 10%!important;
      background-color: #fff;
      border: 1px solid #aaa;
      border-radius: 4px;
      height: 20px;;
   }*/
   .btn-primary {
     width: 85px;
   }
  .btn btn-sm btn-primary{
     width: 100px;
     height: 40px;
     margin-left: 50px;
   }
   label {
    display: inline-block;
    max-width: 100%;
    margin-bottom: 15px;
    font-weight: 700;
    font-size: 15px;
}
    option{
      font-size: 16px;
      font-family: serif;
      font-weight: 100;
      color: black;
    }
    select{
      color: black;
      font-weight: 100;
    }
   .dd-item .set-property{
     width: 20px;
     height: 19px;
     background-color: #dddee1;
     position: relative;
     top: 2px;
     color: #000;
   }
   .dd-item .item-remove{
     width: 20px;
     top: 2px;
     height: 19px;
     position: relative;
   }
   .popover-title {
       padding: 8px 65px;
       margin: 0;
       font-size: 14px;
       background-color: #f7f7f7;
       border-bottom: 1px solid #ebebeb;
       border-radius: 5px 5px 0 0;
       font-weight: 600;
       color: #333;
   }
   input{
     color:black;
     font-family:serif;
   }

   #hidden{
    color: black;
    font-family: serif;
    font-size: 16px;
    float: right;
    margin-top: -22px;
    margin-right: 56px;
   }

   .dd-edit-box i {
    right: 0;
    overflow: hidden;
    cursor: pointer;
    position: absolute;
    font-style: normal;
    margin-top: 2%;
    font-size: 20px;
}

	/*.dd {
	  position: relative;
	  display: inline-block;
	  margin: 0;
	  padding: 0;
	  width: 100%;
	  list-style:  none;
	  font-family: 'Helvetica Neue', Arial, sans-serif;
	  font-size:   13px;
	  line-height: 20px;
	}

	.dd-edit-box input,
	  .dd-edit-box select,
	.dd-edit-box textarea {
	  border:             none;
	  -webkit-box-shadow: none;
	  -moz-box-shadow:    none;
	  box-shadow:         none;
	  background:         transparent;
	  text-overflow:      ellipsis;
	  outline:            none;
	  font-size:          13px;
	  color:              #444;
	  text-shadow:        0 1px 0 #fff;
	  width:              30%;
	}

	.dd-edit-box input::selection,
	.dd-edit-box textarea::selection {
	  color: #fff;
	  background: #0e90d2;
	}

	.dd-edit-box input:focus,
	.dd-edit-box textarea:focus {
	  text-shadow: none;
	}
	.dd-button-container .custom-button-example {
	  color: #000;
	  text-align: center;
	  padding: 1px 4px;
	}

	.dd-edit-box select {
	  width: 30%;
	}

	.dd-edit-box > * {
	  vertical-align: top;
	}

	.dd-edit-box input, .dd-edit-box select, .dd-edit-box textarea {
	  margin-bottom: 0;
	}

	.dd-edit-box {
	  position: relative;
	}

	.dd-edit-box i {
	  right:    0;
	  overflow: hidden;
	  cursor:   pointer;
	  position: absolute;
	  font-style: normal;
	}

	.dd-item-blueprint {
	  display: none;
	}

	.dd > .dd-list {
	  min-height: 80px;
	}

	.dd-list {
	  display:    block;
	  position:   relative;
	  margin:     0;
	  padding:    0;
	  list-style: none;
	}

	.dd-list .dd-list {
	  left: 30px;
	  margin-right: 30px;
	}

	.dd-collapsed .dd-list {
	  display: none;
	}

	.dd-item,
	.dd-empty,domenu-1
	.dd-placeholder {
	  text-shadow: 0 1px 0 #fff;
	  display:     block;
	  position:    relative;
	  margin:      0;
	  padding:     0;
	  min-height:  20px;
	  font-size:   13px;
	  line-height: 20px;
	}

	.dd-handle {
	  cursor:                move;
	  display:               block;
	  margin:                5px 0;
	  padding:               5px 10px;
	  color:                 #333;
	  text-decoration:       none;
	  font-weight:           bold;
	  border:                1px solid #aaa;
	  background:            #c8c8c8;
	  background:            -webkit-linear-gradient(top, #c8c8c8 0%, #8c8c8c 100%);
	  background:            -moz-linear-gradient(top, #c8c8c8 0%, #8c8c8c 100%);
	  background:            linear-gradient(top, #c8c8c8 0%, #8c8c8c 100%);
	  -webkit-border-radius: 3px;
	  border-radius:         3px;
	  box-sizing:            border-box;
	  -moz-box-sizing:       border-box;
	}

	.dd-handle:hover {
	  color:      #2ea8e5;
	  background: #fff;
	}

	.dd-item > button {
	  display:     inline-block;
	  position:    relative;
	  cursor:      pointer;
	  float:       left;
	  width:       24px;
	  height:      20px;
	  margin:      5px 5px 5px 30px;
	  padding:     0;
	  white-space: nowrap;
	  overflow:    hidden;
	  border:      0;
	  background:  transparent;
	  font-size:   12px;
	  line-height: 1;
	  text-align:  center;
	  font-weight: bold;
	  color:       black;
	}

	.dd.domenu .dd-new-item {
	    background: transparent;
	    border: 3px dotted #8F8F8F;
	    border-radius: 11px;
	    width: 100%;
	    height: 35px;
	    font-size: 29px;
	    color: #8F8F8F;
	    outline: none;
	}

	.dd-item .item-remove-confirm,
	.dd-item .item-add {
    position: absolute;
    overflow: auto;
    width: 20px;
    padding: 0 5px;
	}

	.dd-item .dd-button-container button {
	  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.51), rgba(0, 0, 0, 0.14));
	  border:           1px solid #898989;
	  border-radius:    2px;
	  font:             normal 12px/18px Helvetica, Lato, Arial sans-serif;
	  cursor:           pointer;
	}

	.dd-item .dd-button-container .item-add {
	  background-color: #55b3ff;
	  border-color:     #376f9c;
	  color:            #ffffff;
	  text-shadow:      0 1px 0 #2b77b5;
	  box-shadow:       inset 0 1px 0 #cfe9ff;
	}

	.dd-item .dd-button-container .item-add:active {
	  box-shadow: inset 0 1px 3px #376f9c;
	}

	.dd-item .dd-button-container .item-remove {
	  background-color: #ff5555;
	  border-color:     #a54b4b;
	  color:            #5a1111;
	  text-shadow:      0 1px 0 #ffc0c0;
	  box-shadow:       inset 0 1px 0 #ffc0c0;
	  transition:       background-color 0.35s;
    margin-left: -20px;
	}

	.dd-item .dd-button-container .item-remove:active {

	  box-shadow: inset 0 1px 5px #a54b4b;
	}

	.dd-item .dd-button-container .item-remove-confirm {

	  background-color: #ffa155;

	  transition:       background-color 0.35s;

	  border-color:     #ad7232;
	}

	.dd-item .dd-button-container .item-remove-confirm:active {

	}

	.item-remove-confirm {
	  background: #ffce66;
	}

	.dd-item .dd-button-container {
	  position: absolute;
	  height:   19px;
	  padding:  0 5px;
	  top:      4px;
	  overflow: visible;
	  display:  none;
	  right:    0;
	}


	.dd3-item > button:first-child {
	  margin-left: 30px;
	}

	.dd-item > button:before {
	  display:     block;
	  position:    absolute;
	  width:       100%;
	  text-align:  center;
	  text-indent: 0;
	}

	.dd-placeholder,
	.dd-empty {
	  margin:          5px 0;
	  padding:         0;
	  min-height:      30px;
	  background: #D6F2FF;
	  border: 1px dashed #6C9AB1;
	  box-sizing:      border-box;
	  -moz-box-sizing: border-box;
	}

	.dd-placeholder.max-depth {
	  background: #ffb3b7;
	  border: 1px dashed #b14444;
	}

	.dd-empty {
	  border:              1px dashed #bbb;
	  min-height:          100px;
	  background-color:    #e5e5e5;
	  background-image:    -webkit-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff),
	                       -webkit-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff);
	  background-image:    -moz-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff),
	                       -moz-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff);
	  background-image:    linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff),
	                       linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff);
	  background-size:     60px 60px;
	  background-position: 0 0, 30px 30px;
	}

	.dd-dragel {
	  height:         60px;
	  position:       absolute;
	  pointer-events: none;
	  z-index:        9999;
	}

	.dd-dragel > .dd-item .dd-handle {
	  margin-top: 0;
	}

	.dd-dragel .dd-handle {
	  -webkit-box-shadow: 2px 4px 6px 0 rgba(0, 0, 0, .1);
	  box-shadow:         2px 4px 6px 0 rgba(0, 0, 0, .1);
	}
	.dd3-content {
    width:                35%;
	  display:               block;
	  height:                100%;
	  margin:                5px 0;
	  padding:               5px 10px 5px 40px;
	  color:                 #333;
	  text-decoration:       none;
	  font-weight:           bold;
	  border:                1px solid #ccc;
	  border:                1px solid #898989;
	  background:            #fafafa;
	  background:            -webkit-linear-gradient(top, #f4f4f4 10%, #c9c9c9 100%);
	  background:            -moz-linear-gradient(top, #f4f4f4 10%, #c9c9c9 100%);
	  background:            linear-gradient(top, #f4f4f4 10%, #c9c9c9 100%);
	  -webkit-border-radius: 3px;
	  border-radius:         3px;
	  box-sizing:            border-box;
	  -moz-box-sizing:       border-box;
	}

	.dd3-content:hover {
	  color:      #2ea8e5;
	  background: #c8c8c8;
	  background: -webkit-linear-gradient(top, #e5e5e5 10%, #ffffff 100%);
	  background: -moz-linear-gradient(top, #e5e5e5 10%, #ffffff 100%);
	  background: linear-gradient(top, #e5e5e5 10%, #ffffff 100%);
	}

	.dd-dragel > .dd3-item > .dd3-content {
	  margin: 0;
	}

	.dd3-handle {
	  position:                   absolute;
	  margin:                     0;
	  left:                       0;
	  top:                        0;
	  cursor:                     move;
	  width:                      30px;
	  text-indent:                100%;
	  white-space:                nowrap;
	  overflow:                   hidden;
	  border:                     1px solid #807b7b;
	  text-shadow:                0 1px 0 #807b7b;
	  background:                 #c8c8c8;
	  background:                 -webkit-linear-gradient(top, #c8c8c8 0%, #8c8c8c 100%);
	  background:                 -moz-linear-gradient(top, #c8c8c8 0%, #8c8c8c 100%);
	  background:                 linear-gradient(top, #c8c8c8 0%, #8c8c8c 100%);
	  border-top-right-radius:    0;
	  border-bottom-right-radius: 0;
	}

	.dd3-handle:before {
	  content:     '\2263';
	  display:     block;
	  position:    absolute;
	  left:        0;
	  top:         3px;
	  width:       100%;
	  text-align:  center;
	  text-indent: 0;
	  color:       #fff;
	  font-size:   20px;
	  font-weight: normal;
	}

	.dd3-handle:hover {
	  background: #c8c8c8;
	  background: -webkit-linear-gradient(top, #c8c8c8 0%, #8c8c8c 100%);
	  background: -moz-linear-gradient(top, #c8c8c8 0%, #8c8c8c 100%);
	  background: linear-gradient(top, #c8c8c8 0%, #8c8c8c 100%);
	}

	.dd3-content:hover .dd-button-container {
	  display:    block;
	  transition: display 2s;
	}

	 {
	    width: 35%;

	    border: 2px dashed #BDBDBD;
	    background: transparent;
	    border-radius: 3px;
	    font-size: 21px;
	    color: #BDBDBD;
	    cursor: pointer;
	    transition: border 0.35s ease 0s, color 0.35s ease 0s;
	    outline: none;
	}

	.dd .dd-new-item:hover {
	    border: 2px dashed #595858;
	    color: #595858;
	    transition: border 0.35s ease 0s, color 0.35s ease 0s;
	}

	.end-edit{
		background-color: #2095F2;
		padding: 3px 10px;
		color: #fff;
		font-weight: normal;
		text-shadow: none;
		border-radius: 3px;
		border: 1px solid #999;
	}
  .categories-list {max-width: 500px;}
  .categories-list .dd3-content {width: 100%;}*/
</style>
