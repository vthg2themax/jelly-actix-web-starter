use std::env;
<<<<<<< HEAD
use std::fs;
//use std::fs::File;
//use std::io::Write;
use std::path::{Path, PathBuf};
=======
//use std::fs::File;
//use std::io::Write;
//use std::path::Path;
>>>>>>> trunk
use std::process::Command;
use std::process::Stdio;

fn main() {
<<<<<<< HEAD
    

    let _out_dir = env::var("OUT_DIR").unwrap();
    
    let output = if cfg!(target_os = "windows") {
=======
    let _out_dir = env::var("OUT_DIR").unwrap();
    
    let _output = if cfg!(target_os = "windows") {
>>>>>>> trunk
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

<<<<<<< HEAD
    println!("cargo:warning=output ran with status: '{:?}'", String::from_utf8(output.stdout).unwrap());
    if cfg!(target_os = "windows") {
        println!("cargo:warning=You ran this on Windows");
    } else {
        println!("cargo:warning=You ran this on something not Windows. Thanks!");
    };

=======
>>>>>>> trunk
    //Minify the CSS with the tailwindcss tool
    let tailwindcss_status =
        Command::new("./tailwindcss-linux-x64")
            .arg("-i").arg("src/css/site.css") 
            .arg("-o").arg("assets/css/site.css")
            .arg("--minify")
            .spawn()
            .expect("Tailwind command failed to start!"); 
    
    println!("cargo:warning=tailwindcss-linux-x64 ran with status: '{:?}'", tailwindcss_status=tailwindcss_status);

<<<<<<< HEAD
    //Get the current directory
    let current_dir = String::from(
                        format!("{}",
                            env::current_dir()
                                .expect("current_dir failed!")
                                .display()
                        )
                      );    
    println!("cargo:warning=current_dir={}",&current_dir);

    let parent_dir = Path::new(&current_dir).parent().unwrap();
    println!("cargo:warning=parent_dir={}",&parent_dir.display());

    //Get the path to your git repo for SWC
    let mut swc_cli_dir = PathBuf::from(parent_dir);
    swc_cli_dir.push("swc");
    swc_cli_dir.push("crates");
    swc_cli_dir.push("swc_cli");
    
    println!("cargo:warning=directory '{}'",&swc_cli_dir.display());
    
    //Clean up the SWC tool
    let git_reset_status =
        Command::new("git")
            .arg("reset")
            .arg("--hard")
            .current_dir(format!("{}",&swc_cli_dir.display()))
            .spawn()
            .expect("Git Reset command failed to start!");     
    println!("cargo:warning=git reset ran with status: '{:?}'", git_reset_status);
    
    //Pull the latest SWC rust based tool source
    let git_pull_status =
        Command::new("git")
            .arg("pull")
            .current_dir(format!("{}",&swc_cli_dir.display()))
            .spawn()
            .expect("Git Pull command failed to start!"); 
    println!("cargo:warning=git pull ran with status: '{:?}'", git_pull_status);
    
    //Now build the release version of the SWC tool
    let cargo_build_status =
    Command::new("cargo")
        .arg("build")
        .arg("--release")
        .arg("--verbose")
        .current_dir(format!("{}",&swc_cli_dir.display()))
        .spawn()
        .expect("Cargo Build command failed to start!"); 
    println!("cargo:warning=cargo_build ran with status: '{:?}'", cargo_build_status);

    //now use the release version to minify the src files


=======
>>>>>>> trunk
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