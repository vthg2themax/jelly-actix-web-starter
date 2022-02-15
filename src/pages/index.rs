use actix_web::web::{resource, ServiceConfig};
use mime::TEXT_HTML;
use actix_http::Response;
use actix_http::http::header::ContentType;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, HttpRequest, Responder};
use black_marlin::TemplateOnce;

// pub async fn homepage(request: HttpRequest) -> Result<HttpResponse> {
//     request.render(200, "index.html", {
//         let context = Context::new();
//         context
//     })
// }


#[get("/")]
pub async fn index() -> impl Responder {
    
    let ctx = SiteTemplate {
        messages: vec![String::from("foo"), String::from("bar")],
    };

    HttpResponse::Ok()
        .content_type(TEXT_HTML.to_string())
        .header("X-Hdr", "sample")
        .body(String::from(ctx.render_once().unwrap()))

}

#[derive(TemplateOnce)]  // automatically implement `TemplateOnce` trait
#[template(path = "index.stpl")]  // specify the path to template
struct SiteTemplate {
    // data to be passed to the template
    messages: Vec<String>,
}

#[get("/{id}/{name}/index.html")]
async fn index2(web::Path((id, name)): web::Path<(u32, String)>) -> impl Responder {
    format!("Hello {}! id:{}", name, id)
}