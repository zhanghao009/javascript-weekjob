const tmp = `<div class="newslist">
    <div class="img" v-if="info.showImage"><img src="{{image}}"/></div>
    <div class="date" v-if="info.showDate">{{info.name}}/></div>
    <div class="img">{{info.name}}/></div>
</div>`;

const data = {
    image: "some img",
    info: {
        showImage: true,
        showDate:false,
        name: "aaa"
    }
};
 
// function render(tmp, data) {
//     return tmp.replace(//g, (str, $1) => {
//         return data[$1];
//     });
// };