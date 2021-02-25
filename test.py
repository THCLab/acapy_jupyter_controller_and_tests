import inspect
import cProfile


def get_line_and_file_at_callsite(indirection_number):
    """
    Prints the line and filename.

    If 1 is passed it prints at function call site

    If 2 is passed it prints at callsite of a function
    which called the function which contained this

    Purpose:
        When you use VSCode it should jump you to the line from clicking on cmd

    """
    caller_frame_record = inspect.stack()[indirection_number]

    frame = caller_frame_record[0]
    info = inspect.getframeinfo(frame)
    filename = info.filename
    filename = filename.replace("/home/indy/", "")

    msg = (
        f"\n-------------------------------------------------------------------\n"
        f"ASSERT Incorrect type\n"
        f"FILE: {filename}:{info.lineno}\n"
        f"-------------------------------------------------------------------\n"
    )
    return msg


def assert_type(value, Type):
    result = isinstance(value, Type)
    if not result:

        print("Value: ", value)
        assert 0, (
            f"ERROR: Incorrect type! should be {Type} but is of type {type(value)}"
            + get_line_and_file_at_callsite(2)
        )


assert_type(1, str)
# cProfile.run("assert_type(1, str)")
