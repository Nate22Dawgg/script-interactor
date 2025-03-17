
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      className="w-full py-6 bg-secondary/50 border-t border-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ScriptInteractor. All rights reserved.
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              Documentation
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
