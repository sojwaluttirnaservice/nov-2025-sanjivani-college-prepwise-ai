
const Container = ({ children, className }) => {
    return (
        <div className={`container mx-auto px-6 ${className}`}>
            {children}
        </div>
    )
}

export default Container