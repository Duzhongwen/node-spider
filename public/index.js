$(function(){
    if($('.content').length ===0 ){
        $('#save').attr('style', 'display:none')
    }
    $("#sortable").sortable();
    $("#sortable").disableSelection();
    //搜索微信文章
    $('#search').click(function(){
        var articalUrl = $('#search-input').val();
        var reg = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
        if(!reg.test(articalUrl)){
            alert('URL格式不对');
            return;
        }
        // 效验url是否有效
        var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/; 
        if(urlReg.exec(articalUrl)[0] !== "mp.weixin.qq.com"){
            alert('访问的URL不是一个微信页面');
            return;
        };
         $.get('/?ajax=1&wechatUrl=' + articalUrl, function (res) {
            $('.artical-detail').html(res);
            hiddenButton();
        });  
    });
    
    $(document).delegate('.delete', 'click', function () {
        $(this).closest('li').remove();
        hiddenButton();
    })

    // 提交保存
    $('#save').click(function(){
        var count = 0;
        var articalData = {
            title: $('.ui-sortable .artical-detail').attr('title'),
            summary: $('.ui-sortable .artical-detail').attr('summary'),
            author: $('.ui-sortable .artical-detail').attr('author'),
            data: []
        };
        
        // 对提交数据进行格式处理
        $(".content").each(function(){
            var obj = {
                type: 0,
                data:  $(this).find('img').attr('src'),
                index: count
            };
            articalData.data.push(obj);
            var temp = {
                type: 1,
                data:  $(this).find('input').val(),
                index: count+1
            }
            articalData.data.push(temp);
            count +=2 ;
        });

        // ajax 提交
        $.ajax({
            url: '/submit',
            type: 'POST',
            data: JSON.stringify(articalData),
            contentType : 'application/json',
            success: function (feedback) {
                alert('保存成功');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error ' + textStatus + " " + errorThrown);
                alert("保存失败");
            }
        });
    })

    function hiddenButton(){
        if($('.content').length >0 ){
            $('#save').removeAttr('style','display:none');
        } else {
          $('#save').attr('style','display:none');
        }
    }
})