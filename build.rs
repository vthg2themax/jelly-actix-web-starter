use std::env;
//use std::fs::File;
//use std::io::Write;
//use std::path::Path;
use std::process::Command;
use std::process::Stdio;

fn main() {
    let _out_dir = env::var("OUT_DIR").unwrap();
    
    let _output = if cfg!(target_os = "windows") {
        Command::new("cmd")
                .args(["/C", "echo hello"])
                .output()
                .expect("failed to execute process")
    } else {
        Command::new("sh")
                .arg("-c")
                .arg("echo hello")
                .output()
                .expect("failed to execute process")
    };

    //Minify the CSS with the tailwindcss tool
    let tailwindcss_status =
        Command::new("./tailwindcss-linux-x64")
            .arg("-i").arg("src/css/site.css") 
            .arg("-o").arg("assets/css/site.css")
            .arg("--minify")
            .spawn()
            .expect("Tailwind command failed to start!"); 
    
    println!("cargo:warning=tailwindcss-linux-x64 ran with status: '{:?}'", tailwindcss_status=tailwindcss_status);

    //copy the images over
    let _img_directory_mkdir_status =
        Command::new("mkdir")
            .arg("-vp")
            .arg("assets/img") 
            .spawn()
            .expect("Image mkdir command failed to start!");
    let _img_copy_status =
        Command::new("cp")
            .arg("-rv")
            .arg("src/img") 
            .arg("assets/")
            .spawn()
            .expect("Image Copy command failed to start!");

    //copy the template pages over
    let _img_directory_mkdir_status =
        Command::new("mkdir")
            .arg("-vp")
            .arg("assets/pages") 
            .spawn()
            .expect("Template Pages mkdir command failed to start!");
    let img_copy_status =
    Command::new("find")  
        .args(["src/pages","-name","*.stpl","-exec","cp","-v","{}","assets/pages",";"])
        .stdout(Stdio::piped())
        // execute the command, wait for it to complete, then capture the output
        .output()
        // Blow up if the OS was unable to start the program
        .unwrap();

    // extract the raw bytes that we captured and interpret them as a string
    let stdout = String::from_utf8(img_copy_status.stdout).unwrap();
    println!("cargo:warning=stdoout says:{:?}", stdout);

    // println!("{}", stdout);
    //         .spawn() 
    //         .expect("Template Pages Copy command failed to start!");
            
    
    //let dest_path = Path::new(&out_dir).join("hello.rs");
    //let mut f = File::create(&dest_path).unwrap();

    // f.write_all(b"
    //     pub fn message() -> &'static str {
    //         \"Hello, World!\"
    //     }
    // ").unwrap();

}